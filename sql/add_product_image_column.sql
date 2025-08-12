-- Adicionar coluna para URL da imagem do produto
-- Execute este SQL no painel do Supabase em: SQL Editor

-- Adicionar coluna para URL da imagem
ALTER TABLE vendas 
ADD COLUMN product_image_url TEXT;

-- Adicionar comentário para documentação
COMMENT ON COLUMN vendas.product_image_url IS 'URL da imagem do produto do Shopify';

-- Verificar se a coluna foi adicionada
SELECT 
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL"
FROM information_schema.columns 
WHERE table_name = 'vendas' 
AND column_name = 'product_image_url';