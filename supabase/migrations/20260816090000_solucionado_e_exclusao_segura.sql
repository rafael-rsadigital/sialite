-- Adiciona o campo "solucionado" às reclamações que pediram retorno e cria
-- funções seguras para excluir gestores e empresas (a exclusão direta falha
-- hoje quando existe um login vinculado, por causa da checagem de escopo em
-- public.perfis). Execute no SQL Editor do Supabase/Lovable antes de publicar
-- o frontend que depende disso. Pode ser executada novamente sem problema.

begin;

-- 1. Campo de acompanhamento da reclamação ------------------------------------
alter table public.feedbacks
  add column if not exists solucionado boolean not null default false;

comment on column public.feedbacks.solucionado is
  'Marcado quando o retorno solicitado pelo cliente já foi resolvido.';

-- Permite que administrador, gestor (empresas sob sua gestão) e a própria
-- empresa marquem uma reclamação como solucionada. Mesmo escopo da leitura.
drop policy if exists "Contas autorizadas atualizam o status de solução" on public.feedbacks;

create policy "Contas autorizadas atualizam o status de solução"
  on public.feedbacks for update to authenticated
  using (
    public.eh_administrador()
    or empresa_id = public.empresa_atual_id()
    or exists (
      select 1 from public.empresas e
      where e.id = feedbacks.empresa_id
        and e.gestor_id = public.gestor_atual_id()
    )
  )
  with check (
    public.eh_administrador()
    or empresa_id = public.empresa_atual_id()
    or exists (
      select 1 from public.empresas e
      where e.id = feedbacks.empresa_id
        and e.gestor_id = public.gestor_atual_id()
    )
  );

-- 2. Exclusão segura de gestores e empresas ------------------------------------
-- Excluir a linha diretamente falha quando existe um perfil (login) apontando
-- para o gestor/empresa, pois a checagem em public.perfis exige gestor_id (ou
-- empresa_id) preenchido para aquele papel. Estas funções removem primeiro os
-- acessos vinculados e só então excluem o cadastro.

create or replace function public.excluir_gestor(p_gestor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.eh_administrador() then
    raise exception 'Apenas administradores podem excluir gestores';
  end if;

  delete from public.perfis where gestor_id = p_gestor_id;
  delete from public.gestores where id = p_gestor_id;
end;
$$;

create or replace function public.excluir_empresa(p_empresa_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.eh_administrador() then
    raise exception 'Apenas administradores podem excluir empresas';
  end if;

  delete from public.perfis where empresa_id = p_empresa_id;
  delete from public.empresas where id = p_empresa_id;
end;
$$;

grant execute on function public.excluir_gestor(uuid) to authenticated;
grant execute on function public.excluir_empresa(uuid) to authenticated;

commit;
