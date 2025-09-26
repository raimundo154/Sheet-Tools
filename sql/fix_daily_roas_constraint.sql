-- ==========================================
-- FIX: Adicionar constraint única para daily_roas_data
-- ==========================================

-- Verificar se a constraint já existe
DO $$
BEGIN
    -- Tentar adicionar a constraint única
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_user_date_product' 
        AND conrelid = 'daily_roas_data'::regclass
    ) THEN
        -- Adicionar constraint única para evitar duplicados
        ALTER TABLE daily_roas_data 
        ADD CONSTRAINT unique_user_date_product 
        UNIQUE(user_id, date, product_name);
        
        RAISE NOTICE 'Constraint unique_user_date_product adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Constraint unique_user_date_product já existe';
    END IF;
END $$;

-- Verificar se a constraint foi criada
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'daily_roas_data'::regclass 
AND conname = 'unique_user_date_product';
