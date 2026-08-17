CREATE OR REPLACE VIEW public.empresas_publicas AS
  SELECT slug, nome_exibicao, link_google, whatsapp_empresa, email_empresa, modelo_sugestao, status_assinatura
  FROM public.empresas
  WHERE status_assinatura = true;

ALTER VIEW public.empresas_publicas SET (security_invoker = on);
GRANT SELECT ON public.empresas_publicas TO anon, authenticated;