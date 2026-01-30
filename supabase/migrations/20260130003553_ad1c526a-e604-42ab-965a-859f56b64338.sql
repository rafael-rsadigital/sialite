-- Adicionar colunas de gestão de assinaturas na tabela empresas
ALTER TABLE public.empresas
ADD COLUMN status_assinatura boolean NOT NULL DEFAULT true,
ADD COLUMN data_vencimento date,
ADD COLUMN valor_assinatura decimal(10,2) DEFAULT 0,
ADD COLUMN link_asaas text;