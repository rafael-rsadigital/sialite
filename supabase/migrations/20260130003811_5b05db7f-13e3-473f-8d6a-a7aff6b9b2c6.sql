-- Adicionar política para permitir UPDATE na tabela empresas (necessário para admin)
CREATE POLICY "Empresas podem ser atualizadas" 
ON public.empresas 
FOR UPDATE 
USING (true)
WITH CHECK (true);