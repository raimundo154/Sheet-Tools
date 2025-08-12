-- SQL para adicionar campo shop_domain (caso necessário)
-- Execute este SQL no painel do Supabase em: SQL Editor

-- 1. Verificar se o campo já existe na tabela vendas
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'vendas' 
    AND column_name = 'shop_domain';

-- 2. Adicionar campo shop_domain na tabela vendas (caso não exista)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendas' 
        AND column_name = 'shop_domain'
    ) THEN
        ALTER TABLE vendas ADD COLUMN shop_domain TEXT;
        RAISE NOTICE 'Campo shop_domain adicionado à tabela vendas';
    ELSE
        RAISE NOTICE 'Campo shop_domain já existe na tabela vendas';
    END IF;
END $$;

-- 3. Verificar se o campo já existe na tabela user_shops
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_shops' 
    AND column_name = 'shop_domain';

-- 4. Adicionar campo shop_domain na tabela user_shops (caso não exista)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_shops' 
        AND column_name = 'shop_domain'
    ) THEN
        ALTER TABLE user_shops ADD COLUMN shop_domain TEXT NOT NULL;
        CREATE UNIQUE INDEX idx_user_shops_domain_unique ON user_shops(shop_domain);
        RAISE NOTICE 'Campo shop_domain adicionado à tabela user_shops';
    ELSE
        RAISE NOTICE 'Campo shop_domain já existe na tabela user_shops';
    END IF;
END $$;

-- 5. Verificar estrutura final das tabelas
SELECT 
    'Estrutura tabela vendas:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'vendas'
ORDER BY ordinal_position;

SELECT 
    'Estrutura tabela user_shops:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_shops'
ORDER BY ordinal_position;