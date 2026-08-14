-- SIA Lite: autenticação, multiempresa, multigestor e base de assinaturas.
-- Esta migração preserva cadastros e feedbacks existentes. Revise e execute no
-- SQL Editor do Supabase/Lovable antes de publicar o código que depende dela.

begin;

-- 1. Perfis vinculados ao Supabase Auth ---------------------------------------
do $$
begin
  create type public.papel_sia as enum ('administrador', 'gestor', 'empresa');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  papel public.papel_sia not null default 'empresa',
  empresa_id uuid references public.empresas(id) on delete set null,
  gestor_id uuid references public.gestores(id) on delete set null,
  nome_exibicao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint perfis_escopo_compativel check (
    (papel = 'administrador' and empresa_id is null and gestor_id is null)
    or (papel = 'gestor' and gestor_id is not null and empresa_id is null)
    or (papel = 'empresa' and empresa_id is not null and gestor_id is null)
  )
);

create index if not exists idx_perfis_empresa_id on public.perfis(empresa_id);
create index if not exists idx_perfis_gestor_id on public.perfis(gestor_id);

-- Informações preparatórias para cobrança futura. Nenhuma cobrança é criada
-- ou disparada por esta migração.
alter table public.empresas
  add column if not exists plano_assinatura text not null default 'essencial',
  add column if not exists ciclo_cobranca text not null default 'mensal',
  add column if not exists status_cobranca text not null default 'ativo',
  add column if not exists periodo_teste_ate timestamptz,
  add column if not exists cancelado_em timestamptz;

alter table public.empresas
  drop constraint if exists empresas_plano_assinatura_check,
  add constraint empresas_plano_assinatura_check
    check (plano_assinatura in ('essencial', 'profissional', 'parceiro')),
  drop constraint if exists empresas_ciclo_cobranca_check,
  add constraint empresas_ciclo_cobranca_check
    check (ciclo_cobranca in ('mensal', 'trimestral', 'anual')),
  drop constraint if exists empresas_status_cobranca_check,
  add constraint empresas_status_cobranca_check
    check (status_cobranca in ('teste', 'ativo', 'atrasado', 'cancelado', 'isento'));

-- O fluxo de avaliação usa estes tipos; a limitação antiga aceitava apenas
-- dois valores, embora a interface já registrasse mais opções.
alter table public.feedbacks
  drop constraint if exists feedbacks_tipo_envio_check,
  add constraint feedbacks_tipo_envio_check
    check (tipo_envio in ('anonimo', 'direto', 'google', 'whatsapp', 'email'));

-- 2. Funções auxiliares de autorização ----------------------------------------
create or replace function public.papel_atual()
returns public.papel_sia
language sql
stable
security definer
set search_path = public
as $$
  select papel from public.perfis where id = auth.uid()
$$;

create or replace function public.eh_administrador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.papel_atual() = 'administrador', false)
$$;

create or replace function public.gestor_atual_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select gestor_id from public.perfis where id = auth.uid() and papel = 'gestor'
$$;

create or replace function public.empresa_atual_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select empresa_id from public.perfis where id = auth.uid() and papel = 'empresa'
$$;

-- Mostra a empresa publicamente sem expor hash, cobrança, contatos privados
-- ou identificadores internos.
create or replace view public.empresas_publicas as
select
  slug,
  nome_exibicao,
  link_google,
  whatsapp_empresa,
  email_empresa,
  modelo_sugestao,
  status_assinatura
from public.empresas
where status_assinatura = true
  and status_cobranca in ('teste', 'ativo', 'isento');

-- Registra uma avaliação pública sem conceder INSERT direto na tabela de
-- feedbacks. O slug é resolvido exclusivamente dentro da função.
create or replace function public.registrar_feedback_publico(
  p_slug text,
  p_nota integer,
  p_comentario text default null,
  p_tipo_envio text default 'anonimo'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa_id uuid;
  v_feedback_id uuid;
begin
  if p_nota < 1 or p_nota > 5 then
    raise exception 'A nota deve estar entre 1 e 5';
  end if;

  if p_tipo_envio not in ('anonimo', 'direto', 'google', 'whatsapp', 'email') then
    raise exception 'Tipo de envio inválido';
  end if;

  select id
    into v_empresa_id
  from public.empresas
  where slug = lower(trim(p_slug))
    and status_assinatura = true
    and status_cobranca in ('teste', 'ativo', 'isento');

  if v_empresa_id is null then
    raise exception 'Empresa não encontrada ou indisponível';
  end if;

  insert into public.feedbacks (empresa_id, nota, comentario, tipo_envio)
  values (v_empresa_id, p_nota, nullif(trim(p_comentario), ''), p_tipo_envio)
  returning id into v_feedback_id;

  return v_feedback_id;
end;
$$;

-- Executar uma única vez no SQL Editor após criar o primeiro usuário em
-- Authentication > Users. A função não é utilizável pelo navegador.
create or replace function public.designar_primeiro_administrador(p_email text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_usuario_id uuid;
begin
  if exists (select 1 from public.perfis where papel = 'administrador') then
    raise exception 'Já existe um administrador cadastrado';
  end if;

  select id into v_usuario_id
  from auth.users
  where lower(email) = lower(trim(p_email));

  if v_usuario_id is null then
    raise exception 'Usuário não encontrado em Authentication > Users';
  end if;

  insert into public.perfis (id, papel, nome_exibicao)
  values (v_usuario_id, 'administrador', p_email);
end;
$$;

-- Administradores podem atribuir contas já criadas no Auth a empresas ou
-- gestores sem precisar tocar no banco manualmente.
create or replace function public.atribuir_acesso(
  p_usuario_id uuid,
  p_papel public.papel_sia,
  p_empresa_id uuid default null,
  p_gestor_id uuid default null,
  p_nome_exibicao text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.eh_administrador() then
    raise exception 'Apenas administradores podem atribuir acessos';
  end if;

  if (p_papel = 'administrador' and (p_empresa_id is not null or p_gestor_id is not null))
     or (p_papel = 'gestor' and (p_gestor_id is null or p_empresa_id is not null))
     or (p_papel = 'empresa' and (p_empresa_id is null or p_gestor_id is not null)) then
    raise exception 'Escopo incompatível com o papel informado';
  end if;

  insert into public.perfis (id, papel, empresa_id, gestor_id, nome_exibicao)
  values (p_usuario_id, p_papel, p_empresa_id, p_gestor_id, p_nome_exibicao)
  on conflict (id) do update set
    papel = excluded.papel,
    empresa_id = excluded.empresa_id,
    gestor_id = excluded.gestor_id,
    nome_exibicao = excluded.nome_exibicao,
    updated_at = now();
end;
$$;

-- 3. Substituição das políticas permissivas ----------------------------------
alter table public.empresas enable row level security;
alter table public.feedbacks enable row level security;
alter table public.gestores enable row level security;
alter table public.leads_teste enable row level security;
alter table public.perfis enable row level security;

drop policy if exists "Empresas são públicas para leitura via slug" on public.empresas;
drop policy if exists "Qualquer um pode inserir empresa" on public.empresas;
drop policy if exists "Empresas podem ser atualizadas" on public.empresas;
drop policy if exists "Qualquer um pode criar feedback" on public.feedbacks;
drop policy if exists "Feedbacks podem ser lidos" on public.feedbacks;
drop policy if exists "Gestores podem ser lidos" on public.gestores;
drop policy if exists "Qualquer um pode inserir gestor" on public.gestores;
drop policy if exists "Gestores podem ser atualizados" on public.gestores;
drop policy if exists "Gestores podem ser deletados" on public.gestores;
drop policy if exists "Qualquer um pode criar lead de teste" on public.leads_teste;
drop policy if exists "Leads podem ser lidos" on public.leads_teste;

-- Também remove as políticas desta própria migração para permitir nova execução
-- segura caso a configuração tenha sido iniciada anteriormente.
drop policy if exists "Perfis próprios ou administração" on public.perfis;
drop policy if exists "Administração gerencia perfis" on public.perfis;
drop policy if exists "Admin vê todas as empresas; contas veem o próprio escopo" on public.empresas;
drop policy if exists "Administração e gestores cadastram empresas próprias" on public.empresas;
drop policy if exists "Administração e gestores atualizam o próprio escopo" on public.empresas;
drop policy if exists "Somente administração exclui empresas" on public.empresas;
drop policy if exists "Administração ou gestor responsável leem gestores" on public.gestores;
drop policy if exists "Somente administração gerencia gestores" on public.gestores;
drop policy if exists "Contas autorizadas leem os feedbacks do próprio escopo" on public.feedbacks;
drop policy if exists "Somente administração exclui avaliações" on public.feedbacks;
drop policy if exists "Leads podem ser registrados publicamente" on public.leads_teste;
drop policy if exists "Somente administração vê leads" on public.leads_teste;

create policy "Perfis próprios ou administração"
  on public.perfis for select to authenticated
  using (id = auth.uid() or public.eh_administrador());

create policy "Administração gerencia perfis"
  on public.perfis for all to authenticated
  using (public.eh_administrador())
  with check (public.eh_administrador());

create policy "Admin vê todas as empresas; contas veem o próprio escopo"
  on public.empresas for select to authenticated
  using (
    public.eh_administrador()
    or id = public.empresa_atual_id()
    or gestor_id = public.gestor_atual_id()
  );

create policy "Administração e gestores cadastram empresas próprias"
  on public.empresas for insert to authenticated
  with check (
    public.eh_administrador()
    or (public.papel_atual() = 'gestor' and gestor_id = public.gestor_atual_id())
  );

create policy "Administração e gestores atualizam o próprio escopo"
  on public.empresas for update to authenticated
  using (
    public.eh_administrador()
    or gestor_id = public.gestor_atual_id()
  )
  with check (
    public.eh_administrador()
    or gestor_id = public.gestor_atual_id()
  );

create policy "Somente administração exclui empresas"
  on public.empresas for delete to authenticated
  using (public.eh_administrador());

create policy "Administração ou gestor responsável leem gestores"
  on public.gestores for select to authenticated
  using (public.eh_administrador() or id = public.gestor_atual_id());

create policy "Somente administração gerencia gestores"
  on public.gestores for all to authenticated
  using (public.eh_administrador())
  with check (public.eh_administrador());

create policy "Contas autorizadas leem os feedbacks do próprio escopo"
  on public.feedbacks for select to authenticated
  using (
    public.eh_administrador()
    or empresa_id = public.empresa_atual_id()
    or exists (
      select 1 from public.empresas e
      where e.id = feedbacks.empresa_id
        and e.gestor_id = public.gestor_atual_id()
    )
  );

create policy "Somente administração exclui avaliações"
  on public.feedbacks for delete to authenticated
  using (public.eh_administrador());

create policy "Leads podem ser registrados publicamente"
  on public.leads_teste for insert to anon, authenticated
  with check (true);

create policy "Somente administração vê leads"
  on public.leads_teste for select to authenticated
  using (public.eh_administrador());

-- 4. Privilégios e acesso público restrito -----------------------------------
revoke all on public.empresas, public.feedbacks, public.gestores, public.perfis, public.leads_teste from anon;
revoke all on public.empresas, public.feedbacks, public.gestores, public.perfis, public.leads_teste from authenticated;

grant select, insert, update, delete on public.empresas, public.feedbacks, public.gestores, public.perfis, public.leads_teste to authenticated;
grant insert on public.leads_teste to anon;
grant select on public.empresas_publicas to anon, authenticated;
grant execute on function public.registrar_feedback_publico(text, integer, text, text) to anon, authenticated;
grant execute on function public.atribuir_acesso(uuid, public.papel_sia, uuid, uuid, text) to authenticated;
revoke all on function public.designar_primeiro_administrador(text) from public, anon, authenticated;

commit;

-- ATIVAÇÃO PÓS-MIGRAÇÃO (executar no SQL Editor, depois de criar o usuário):
-- select public.designar_primeiro_administrador('seu-email@dominio.com');
-- A partir daí, entre em /acesso com esse e-mail e sua senha do Supabase Auth.
