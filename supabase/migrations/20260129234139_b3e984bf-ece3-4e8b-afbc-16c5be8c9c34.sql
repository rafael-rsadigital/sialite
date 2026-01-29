-- Adicionar coluna para armazenar link de avaliação nos leads
ALTER TABLE public.leads_teste 
ADD COLUMN link_avaliacao text;