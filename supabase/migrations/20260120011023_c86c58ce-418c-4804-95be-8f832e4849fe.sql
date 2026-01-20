-- Adicionar coluna modelo_sugestao à tabela empresas para textos de inspiração
ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS modelo_sugestao text;