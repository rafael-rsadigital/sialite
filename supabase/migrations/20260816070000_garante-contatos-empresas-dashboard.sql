-- Garante os campos privados de contato usados no dashboard de gestores.
-- A operação é idempotente: se as colunas já existirem, nada é alterado.
-- Não preenche nem remove dados existentes.

alter table public.empresas
  add column if not exists whatsapp_empresa text,
  add column if not exists email_empresa text;

comment on column public.empresas.whatsapp_empresa is
  'WhatsApp privado da empresa para uso administrativo e no dashboard do gestor.';

comment on column public.empresas.email_empresa is
  'E-mail privado da empresa para uso administrativo e no dashboard do gestor.';

-- Os contatos continuam fora da visualização pública usada pela avaliação.
-- A função/visão pública controlada mantém apenas os campos necessários à pesquisa.
