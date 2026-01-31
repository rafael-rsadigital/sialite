-- Criar tabela de gestores (parceiros RSA)
CREATE TABLE public.gestores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  nome TEXT NOT NULL,
  email TEXT,
  hash_acesso TEXT NOT NULL UNIQUE
);

-- Habilitar RLS
ALTER TABLE public.gestores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para gestores
CREATE POLICY "Gestores podem ser lidos" 
ON public.gestores 
FOR SELECT 
USING (true);

CREATE POLICY "Qualquer um pode inserir gestor" 
ON public.gestores 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Gestores podem ser atualizados" 
ON public.gestores 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Gestores podem ser deletados" 
ON public.gestores 
FOR DELETE 
USING (true);

-- Adicionar coluna gestor_id na tabela empresas
ALTER TABLE public.empresas 
ADD COLUMN gestor_id UUID REFERENCES public.gestores(id) ON DELETE SET NULL;