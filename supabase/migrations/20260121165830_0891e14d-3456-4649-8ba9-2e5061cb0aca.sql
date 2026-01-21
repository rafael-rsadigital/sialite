-- Create leads_teste table for tracking demo interests
CREATE TABLE public.leads_teste (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_empresa TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads_teste ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert leads (for demo purposes)
CREATE POLICY "Qualquer um pode criar lead de teste" 
ON public.leads_teste 
FOR INSERT 
WITH CHECK (true);

-- Allow reading leads (for admin purposes later)
CREATE POLICY "Leads podem ser lidos" 
ON public.leads_teste 
FOR SELECT 
USING (true);