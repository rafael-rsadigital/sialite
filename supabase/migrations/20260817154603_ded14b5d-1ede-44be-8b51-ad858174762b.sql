ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS produto_servico text;

CREATE OR REPLACE FUNCTION public.registrar_feedback_publico(p_slug text, p_nota integer, p_comentario text DEFAULT NULL::text, p_tipo_envio text DEFAULT 'anonimo'::text, p_solicitou_retorno boolean DEFAULT false, p_nome_cliente text DEFAULT NULL::text, p_telefone_cliente text DEFAULT NULL::text, p_email_cliente text DEFAULT NULL::text, p_produto_servico text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_empresa_id uuid;
  v_feedback_id uuid;
  v_solicitou_retorno boolean := coalesce(p_solicitou_retorno, false);
  v_nome_cliente text := nullif(trim(coalesce(p_nome_cliente, '')), '');
  v_telefone_cliente text := nullif(trim(coalesce(p_telefone_cliente, '')), '');
  v_email_cliente text := nullif(trim(coalesce(p_email_cliente, '')), '');
  v_produto_servico text := nullif(trim(coalesce(p_produto_servico, '')), '');
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
    email_cliente,
    produto_servico
  ) values (
    v_empresa_id,
    p_nota,
    nullif(trim(coalesce(p_comentario, '')), ''),
    coalesce(nullif(trim(coalesce(p_tipo_envio, '')), ''), 'anonimo'),
    v_solicitou_retorno,
    v_nome_cliente,
    case when v_solicitou_retorno then v_telefone_cliente else null end,
    case when v_solicitou_retorno then v_email_cliente else null end,
    v_produto_servico
  )
  returning id into v_feedback_id;

  return v_feedback_id;
end;
$function$;