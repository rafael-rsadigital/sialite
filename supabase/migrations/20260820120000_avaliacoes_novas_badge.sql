-- Bolinha de "avaliações novas" no admin e no painel do gestor: guarda
-- quando cada usuário (admin/gestor) visitou o dashboard de cada empresa,
-- e uma função que conta quantas avaliações chegaram depois disso.

begin;

create table if not exists public.visualizacoes_dashboard (
  perfil_id uuid not null references public.perfis(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  visto_em timestamptz not null default now(),
  primary key (perfil_id, empresa_id)
);

alter table public.visualizacoes_dashboard enable row level security;

drop policy if exists "Cada usuário lê e grava suas próprias visualizações" on public.visualizacoes_dashboard;

create policy "Cada usuário lê e grava suas próprias visualizações"
  on public.visualizacoes_dashboard for all to authenticated
  using (perfil_id = auth.uid())
  with check (perfil_id = auth.uid());

grant select, insert, update, delete on public.visualizacoes_dashboard to authenticated;

-- Registra/atualiza a marca de "visto agora" para a empresa que o usuário
-- logado está olhando no momento.
create or replace function public.marcar_dashboard_visto(p_empresa_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.visualizacoes_dashboard (perfil_id, empresa_id, visto_em)
  values (auth.uid(), p_empresa_id, now())
  on conflict (perfil_id, empresa_id) do update set visto_em = excluded.visto_em;
end;
$$;

grant execute on function public.marcar_dashboard_visto(uuid) to authenticated;

-- Conta, para cada empresa visível ao usuário logado (RLS de public.empresas
-- já decide isso: administrador vê todas, gestor só as próprias), quantas
-- avaliações chegaram depois da última visita registrada.
create or replace function public.contar_avaliacoes_novas()
returns table (empresa_id uuid, novas bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select
    e.id as empresa_id,
    count(f.id) filter (
      where f.created_at > coalesce(v.visto_em, 'epoch'::timestamptz)
    ) as novas
  from public.empresas e
  left join public.visualizacoes_dashboard v
    on v.empresa_id = e.id and v.perfil_id = auth.uid()
  left join public.feedbacks f
    on f.empresa_id = e.id
  group by e.id;
$$;

grant execute on function public.contar_avaliacoes_novas() to authenticated;

commit;
