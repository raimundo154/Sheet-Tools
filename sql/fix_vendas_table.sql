-- Script para corrigir a tabela vendas existente
-- Execute este SQL no painel do Supabase em: SQL Editor

-- 1. Primeiro vamos verificar se as colunas existem
-- Execute esta query primeiro para ver a estrutura atual:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'vendas' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- 2. Adicionar colunas que podem estar faltando (se não existirem)

-- Adicionar created_at se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendas' 
        AND column_name = 'created_at' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vendas ADD COLUMN created_at timestamp with time zone default timezone('utc'::text, now());
        RAISE NOTICE 'Coluna created_at adicionada';
    ELSE
        RAISE NOTICE 'Coluna created_at já existe';
    END IF;
END $$;

-- Adicionar updated_at se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendas' 
        AND column_name = 'updated_at' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vendas ADD COLUMN updated_at timestamp with time zone default timezone('utc'::text, now());
        RAISE NOTICE 'Coluna updated_at adicionada';
    ELSE
        RAISE NOTICE 'Coluna updated_at já existe';
    END IF;
END $$;

-- Adicionar outras colunas que podem estar faltando

-- customer_email
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendas' 
        AND column_name = 'customer_email' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vendas ADD COLUMN customer_email text;
        RAISE NOTICE 'Coluna customer_email adicionada';
    ELSE
        RAISE NOTICE 'Coluna customer_email já existe';
    END IF;
END $$;

-- customer_name
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendas' 
        AND column_name = 'customer_name' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vendas ADD COLUMN customer_name text;
        RAISE NOTICE 'Coluna customer_name adicionada';
    ELSE
        RAISE NOTICE 'Coluna customer_name já existe';
    END IF;
END $$;

-- order_number
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendas' 
        AND column_name = 'order_number' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vendas ADD COLUMN order_number text;
        RAISE NOTICE 'Coluna order_number adicionada';
    ELSE
        RAISE NOTICE 'Coluna order_number já existe';
    END IF;
END $$;

-- financial_status
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendas' 
        AND column_name = 'financial_status' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vendas ADD COLUMN financial_status text default 'pending';
        RAISE NOTICE 'Coluna financial_status adicionada';
    ELSE
        RAISE NOTICE 'Coluna financial_status já existe';
    END IF;
END $$;

-- fulfillment_status
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendas' 
        AND column_name = 'fulfillment_status' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vendas ADD COLUMN fulfillment_status text default 'unfulfilled';
        RAISE NOTICE 'Coluna fulfillment_status adicionada';
    ELSE
        RAISE NOTICE 'Coluna fulfillment_status já existe';
    END IF;
END $$;

-- currency
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendas' 
        AND column_name = 'currency' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vendas ADD COLUMN currency text default 'EUR';
        RAISE NOTICE 'Coluna currency adicionada';
    ELSE
        RAISE NOTICE 'Coluna currency já existe';
    END IF;
END $$;

-- shop_domain
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendas' 
        AND column_name = 'shop_domain' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vendas ADD COLUMN shop_domain text;
        RAISE NOTICE 'Coluna shop_domain adicionada';
    ELSE
        RAISE NOTICE 'Coluna shop_domain já existe';
    END IF;
END $$;

-- Adicionar coluna calculada total se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendas' 
        AND column_name = 'total' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vendas ADD COLUMN total numeric(10,2) generated always as (preco * quantidade) stored;
        RAISE NOTICE 'Coluna total adicionada';
    ELSE
        RAISE NOTICE 'Coluna total já existe';
    END IF;
END $$;

-- 3. Atualizar registros existentes com timestamp atual se created_at for null
UPDATE vendas 
SET created_at = timezone('utc'::text, now()),
    updated_at = timezone('utc'::text, now())
WHERE created_at IS NULL OR updated_at IS NULL;

-- 4. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_vendas_created_at ON vendas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendas_order_id ON vendas(order_id);
CREATE INDEX IF NOT EXISTS idx_vendas_customer_email ON vendas(customer_email);

-- 5. Criar função e trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language plpgsql;

-- Remover trigger existente se houver e recriar
DROP TRIGGER IF EXISTS update_vendas_updated_at ON vendas;
CREATE TRIGGER update_vendas_updated_at
    BEFORE UPDATE ON vendas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Configurar RLS se não estiver ativo
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'vendas' 
        AND rowsecurity = true
        AND schemaname = 'public'
    ) THEN
        ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado na tabela vendas';
    ELSE
        RAISE NOTICE 'RLS já está habilitado na tabela vendas';
    END IF;
END $$;

-- 7. Criar políticas RLS se não existirem
-- Política para leitura
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vendas' 
        AND policyname = 'Permitir leitura para usuários autenticados'
    ) THEN
        CREATE POLICY "Permitir leitura para usuários autenticados" ON vendas
            FOR SELECT USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Política de leitura criada';
    ELSE
        RAISE NOTICE 'Política de leitura já existe';
    END IF;
END $$;

-- Política para inserção
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vendas' 
        AND policyname = 'Permitir inserção via service role'
    ) THEN
        CREATE POLICY "Permitir inserção via service role" ON vendas
            FOR INSERT WITH CHECK (auth.role() = 'service_role');
        RAISE NOTICE 'Política de inserção criada';
    ELSE
        RAISE NOTICE 'Política de inserção já existe';
    END IF;
END $$;

-- 8. Verificar estrutura final da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN is_generated = 'ALWAYS' THEN 'GENERATED'
        ELSE 'NORMAL'
    END as column_type
FROM information_schema.columns 
WHERE table_name = 'vendas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mensagem final
DO $$
BEGIN
    RAISE NOTICE '✅ Estrutura da tabela vendas corrigida com sucesso!';
    RAISE NOTICE '📋 Execute agora: SELECT * FROM vendas LIMIT 1; para testar';
END $$;



