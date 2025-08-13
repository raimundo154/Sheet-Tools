-- SCRIPT PARA CORRIGIR MÚLTIPLOS PRODUTOS POR ORDER
-- Execute no SQL Editor do Supabase

-- 1. REMOVER A RESTRIÇÃO UNIQUE DO ORDER_ID
ALTER TABLE vendas DROP CONSTRAINT vendas_order_id_key;

-- 2. ADICIONAR COLUNA PARA IDENTIFICAR CADA ITEM
ALTER TABLE vendas ADD COLUMN line_item_id text;

-- 3. CRIAR NOVA RESTRIÇÃO PARA EVITAR DUPLICATAS
-- (permite múltiplos produtos, mas não duplica o mesmo produto)
CREATE UNIQUE INDEX idx_vendas_order_item 
ON vendas(order_id, produto, COALESCE(line_item_id, ''));

-- 4. ATUALIZAR DADOS EXISTENTES
UPDATE vendas 
SET line_item_id = 'existing_' || id::text 
WHERE line_item_id IS NULL;

-- PRONTO! Agora pode ter múltiplos produtos por order
