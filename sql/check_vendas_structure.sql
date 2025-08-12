-- Script para verificar a estrutura atual da tabela vendas
-- Execute este SQL primeiro no painel do Supabase

-- 1. Verificar se a tabela existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'vendas' 
            AND table_schema = 'public'
        ) 
        THEN '✅ Tabela vendas existe'
        ELSE '❌ Tabela vendas NÃO existe'
    END as status_tabela;

-- 2. Ver todas as colunas da tabela vendas
SELECT 
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL",
    column_default as "Valor Padrão",
    CASE 
        WHEN is_generated = 'ALWAYS' THEN '🔄 GERADA'
        ELSE '📝 NORMAL'
    END as "Tipo de Coluna"
FROM information_schema.columns 
WHERE table_name = 'vendas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar índices
SELECT 
    indexname as "Nome do Índice",
    indexdef as "Definição"
FROM pg_indexes 
WHERE tablename = 'vendas' 
AND schemaname = 'public';

-- 4. Verificar políticas RLS
SELECT 
    policyname as "Nome da Política",
    cmd as "Comando",
    roles as "Funções"
FROM pg_policies 
WHERE tablename = 'vendas';

-- 5. Contar registros na tabela
SELECT COUNT(*) as "Total de Registros" FROM vendas;

-- 6. Ver dados de exemplo (se existirem)
SELECT * FROM vendas LIMIT 3;

