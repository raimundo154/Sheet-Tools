-- ==========================================
-- Adicionar constraint única para daily_roas_data
-- ==========================================

-- Adicionar constraint única para evitar duplicados
-- Esta constraint garante que não pode haver dois produtos com o mesmo nome
-- para o mesmo utilizador na mesma data
ALTER TABLE daily_roas_data 
ADD CONSTRAINT unique_user_date_product 
UNIQUE(user_id, date, product_name);

-- Verificar se a constraint foi criada
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'daily_roas_data'::regclass 
AND conname = 'unique_user_date_product';
