-- 1) Public view runs with the caller's permissions
ALTER VIEW public.empresas_publicas SET (security_invoker = on);

-- 2) Column-level access for anon on empresas (no secrets), plus row filter
REVOKE ALL ON public.empresas FROM anon;
GRANT SELECT (slug, nome_exibicao, link_google, whatsapp_empresa, email_empresa, modelo_sugestao, status_assinatura) ON public.empresas TO anon;

DROP POLICY IF EXISTS "Empresas ativas visíveis publicamente" ON public.empresas;
CREATE POLICY "Empresas ativas visíveis publicamente"
ON public.empresas FOR SELECT TO anon
USING (status_assinatura = true AND status_cobranca IN ('teste','ativo','isento'));

GRANT SELECT ON public.empresas_publicas TO anon, authenticated;

-- 3) Lock down SECURITY DEFINER function execution
REVOKE ALL ON FUNCTION public.papel_atual() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.eh_administrador() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.gestor_atual_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.empresa_atual_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.excluir_gestor(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.excluir_empresa(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.atribuir_acesso(uuid, papel_sia, uuid, uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.designar_primeiro_administrador(text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.papel_atual() TO authenticated;
GRANT EXECUTE ON FUNCTION public.eh_administrador() TO authenticated;
GRANT EXECUTE ON FUNCTION public.gestor_atual_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.empresa_atual_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.excluir_gestor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.excluir_empresa(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.atribuir_acesso(uuid, papel_sia, uuid, uuid, text) TO authenticated;

-- 4) Remove stale overload of the public feedback RPC
DROP FUNCTION IF EXISTS public.registrar_feedback_publico(text, integer, text, text, boolean, text, text, text);

-- 5) Input length limits on feedbacks
UPDATE public.feedbacks SET comentario = left(comentario, 2000) WHERE length(comentario) > 2000;
UPDATE public.feedbacks SET nome_cliente = left(nome_cliente, 120) WHERE length(nome_cliente) > 120;
UPDATE public.feedbacks SET produto_servico = left(produto_servico, 200) WHERE length(produto_servico) > 200;
UPDATE public.feedbacks SET telefone_cliente = left(telefone_cliente, 40) WHERE length(telefone_cliente) > 40;
UPDATE public.feedbacks SET email_cliente = left(email_cliente, 200) WHERE length(email_cliente) > 200;

ALTER TABLE public.feedbacks
  ADD CONSTRAINT feedbacks_comentario_len CHECK (comentario IS NULL OR length(comentario) <= 2000),
  ADD CONSTRAINT feedbacks_nome_len CHECK (nome_cliente IS NULL OR length(nome_cliente) <= 120),
  ADD CONSTRAINT feedbacks_produto_len CHECK (produto_servico IS NULL OR length(produto_servico) <= 200),
  ADD CONSTRAINT feedbacks_telefone_len CHECK (telefone_cliente IS NULL OR length(telefone_cliente) <= 40),
  ADD CONSTRAINT feedbacks_email_len CHECK (email_cliente IS NULL OR length(email_cliente) <= 200),
  ADD CONSTRAINT feedbacks_nota_range CHECK (nota BETWEEN 1 AND 5);

-- 6) Server-side validation in the public RPC
CREATE OR REPLACE FUNCTION public.registrar_feedback_publico(
  p_slug text,
  p_nota integer,
  p_comentario text DEFAULT NULL::text,
  p_tipo_envio text DEFAULT 'anonimo'::text,
  p_solicitou_retorno boolean DEFAULT false,
  p_nome_cliente text DEFAULT NULL::text,
  p_telefone_cliente text DEFAULT NULL::text,
  p_email_cliente text DEFAULT NULL::text,
  p_produto_servico text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  if v_tipo_envio not in ('anonimo','whatsapp','email','google','copiado') then
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

REVOKE ALL ON FUNCTION public.registrar_feedback_publico(text, integer, text, text, boolean, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registrar_feedback_publico(text, integer, text, text, boolean, text, text, text, text) TO anon, authenticated;