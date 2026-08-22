-- Com o novo fluxo (tela de escolha entre "Publicar no Google" e "Enviar
-- direto pra empresa", sem depender da nota — ver conversa sobre review
-- gating), o tipo_envio "direto" passa a ser usado de verdade. Antes ele
-- caía silenciosamente em "anonimo" porque não estava na lista permitida.

create or replace function public.registrar_feedback_publico(
  p_slug text,
  p_nota integer,
  p_comentario text default null::text,
  p_tipo_envio text default 'anonimo'::text,
  p_solicitou_retorno boolean default false,
  p_nome_cliente text default null::text,
  p_telefone_cliente text default null::text,
  p_email_cliente text default null::text,
  p_produto_servico text default null::text
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_empresa_id uuid;
  v_feedback_id uuid;
  v_solicitou_retorno boolean := coalesce(p_solicitou_retorno, false);
  v_comentario text := left(nullif(trim(coalesce(p_comentario, '')), ''), 2000);
  v_nome_cliente text := left(nullif(trim(coalesce(p_nome_cliente, '')), ''), 120);
  v_telefone_cliente text := left(nullif(trim(coalesce(p_telefone_cliente, '')), ''), 40);
  v_email_cliente text := left(nullif(trim(coalesce(p_email_cliente, '')), ''), 200);
  v_produto_servico text := left(nullif(trim(coalesce(p_produto_servico, '')), ''), 200);
  v_tipo_envio text := coalesce(nullif(trim(coalesce(p_tipo_envio, '')), ''), 'anonimo');
begin
  if p_nota is null or p_nota < 1 or p_nota > 5 then
    raise exception 'Nota inválida';
  end if;

  if v_tipo_envio not in ('anonimo','direto','whatsapp','email','google','copiado') then
    v_tipo_envio := 'anonimo';
  end if;

  if v_email_cliente is not null and v_email_cliente !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'E-mail inválido';
  end if;

  if v_telefone_cliente is not null and v_telefone_cliente !~ '^[0-9()+\-\. ]{8,40}$' then
    raise exception 'Telefone inválido';
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
    empresa_id, nota, comentario, tipo_envio, solicitou_retorno,
    nome_cliente, telefone_cliente, email_cliente, produto_servico
  ) values (
    v_empresa_id, p_nota, v_comentario, v_tipo_envio, v_solicitou_retorno,
    v_nome_cliente,
    case when v_solicitou_retorno then v_telefone_cliente else null end,
    case when v_solicitou_retorno then v_email_cliente else null end,
    v_produto_servico
  )
  returning id into v_feedback_id;

  return v_feedback_id;
end;
$function$;

revoke all on function public.registrar_feedback_publico(text, integer, text, text, boolean, text, text, text, text) from public;
grant execute on function public.registrar_feedback_publico(text, integer, text, text, boolean, text, text, text, text) to anon, authenticated;
