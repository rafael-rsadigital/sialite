-- Tabela de empresas
CREATE TABLE public.empresas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  hash_secreto TEXT NOT NULL UNIQUE,
  nome_exibicao TEXT NOT NULL,
  link_google TEXT,
  whatsapp_empresa TEXT,
  email_empresa TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de feedbacks
CREATE TABLE public.feedbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  tipo_envio TEXT NOT NULL DEFAULT 'anonimo' CHECK (tipo_envio IN ('anonimo', 'direto')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para leitura de empresas (via slug)
CREATE POLICY "Empresas são públicas para leitura via slug"
ON public.empresas
FOR SELECT
USING (true);

-- Políticas para feedbacks - qualquer um pode inserir
CREATE POLICY "Qualquer um pode criar feedback"
ON public.feedbacks
FOR INSERT
WITH CHECK (true);

-- Leitura de feedbacks apenas via hash secreto (será validado no código)
CREATE POLICY "Feedbacks podem ser lidos"
ON public.feedbacks
FOR SELECT
USING (true);

-- Índices para performance
CREATE INDEX idx_empresas_slug ON public.empresas(slug);
CREATE INDEX idx_empresas_hash ON public.empresas(hash_secreto);
CREATE INDEX idx_feedbacks_empresa ON public.feedbacks(empresa_id);