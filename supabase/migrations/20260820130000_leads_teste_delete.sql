-- leads_teste tinha grant de delete na tabela, mas nenhuma policy de RLS
-- para a ação — sem policy, o RLS bloqueia mesmo com o grant. Permite que
-- o administrador exclua leads da demonstração.

begin;

drop policy if exists "Somente administração exclui leads" on public.leads_teste;

create policy "Somente administração exclui leads"
  on public.leads_teste for delete to authenticated
  using (public.eh_administrador());

commit;
