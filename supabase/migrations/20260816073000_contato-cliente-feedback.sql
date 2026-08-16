-- Contato estruturado do cliente em reclamações
-- Execute no Lovable Cloud antes de publicar o frontend que usa a nova RPC.
-- Esta migração preserva feedbacks existentes e pode ser executada novamente.

begin;

alter table public.feedbacks
  add column if not exists solicitou_retorno boolean not null default false,
  add column if not exists nome_cliente text,
  add column if not exists telefone_cliente text,
  add column if not exists email_cliente text;

comment on column public.feedbacks.solicitou_retorno is
  'Indica se o cliente pediu retorno sobre a reclamação.';
comment on column public.feedbacks.nome_cliente is
  'Nome informado pelo cliente ao solicitar retorno.';
comment on column public.feedbacks.telefone_cliente is
  'Celular ou WhatsApp informado pelo cliente ao solicitar retorno.';
comment on column public.feedbacks.email_cliente is
  'E-mail informado pelo cliente ao solicitar retorno.';

-- Evita sobreposição com a assinatura antiga de quatro parâmetros.
drop function if exists public.registrar_feedback_publico(text, integer, text, text);

create or replace function public.registrar_feedback_publico(
  p_slug text,
  p_nota integer,
  p_comentario text default null,
  p_tipo_envio text default 'anonimo',
  p_solicitou_retorno boolean default false,
  p_nome_cliente text default null,
  p_telefone_cliente text default null,
  p_email_cliente text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa_id uuid;
  v_feedback_id uuid;
  v_solicitou_retorno boolean := coalesce(p_solicitou_retorno, false);
  v_nome_cliente text := nullif(trim(coalesce(p_nome_cliente, '')), '');
  v_telefone_cliente text := nullif(trim(coalesce(p_telefone_cliente, '')), '');
  v_email_cliente text := nullif(trim(coalesce(p_email_cliente, '')), '');
begin
  if p_nota < 1 or p_nota > 5 then
    raise exception 'Nota inválida';
  end if;

  if v_solicitou_retorno and v_nome_cliente is null then
    raise exception 'Nome obrigatório para solicitar retorno';
  end if;

  if v_solicitou_retorno and v_telefone_cliente is null and v_email_cliente is null then
    raise exception 'Informe celular ou e-mail para solicitar retorno';
  end if;

  select id into v_empresa_id
  from public.empresas
  where slug = p_slug
    and status_assinatura = true
    and status_cobranca in ('teste', 'ativo', 'isento')
  limit 1;

  if v_empresa_id is null then
    raise exception 'Empresa não encontrada';
  end if;

  insert into public.feedbacks (
    empresa_id,
    nota,
    comentario,
    tipo_envio,
    solicitou_retorno,
    nome_cliente,
    telefone_cliente,
    email_cliente
  ) values (
    v_empresa_id,
    p_nota,
    nullif(trim(coalesce(p_comentario, '')), ''),
    coalesce(nullif(trim(coalesce(p_tipo_envio, '')), ''), 'anonimo'),
    v_solicitou_retorno,
    case when v_solicitou_retorno then v_nome_cliente else null end,
    case when v_solicitou_retorno then v_telefone_cliente else null end,
    case when v_solicitou_retorno then v_email_cliente else null end
  )
  returning id into v_feedback_id;

  return v_feedback_id;
end;
$$;

grant execute on function public.registrar_feedback_publico(
  text, integer, text, text, boolean, text, text, text
) to anon, authenticated;

commit;

-- O frontend atualizado envia os três campos estruturados do cliente.
