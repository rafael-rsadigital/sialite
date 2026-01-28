-- Política para permitir inserção de empresas (admin)
CREATE POLICY "Qualquer um pode inserir empresa"
ON public.empresas
FOR INSERT
WITH CHECK (true);