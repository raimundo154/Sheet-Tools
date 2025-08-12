-- Conectar user_id às vendas baseado no shop_domain
-- Execute este SQL no painel do Supabase em: SQL Editor

-- 1. Primeiro, ver os usuários disponíveis
SELECT 
    'Usuários disponíveis:' as info,
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;

-- 2. Ver vendas sem user_id
SELECT 
    'Vendas sem user_id:' as info,
    COUNT(*) as total_vendas_sem_user,
    COUNT(DISTINCT shop_domain) as dominios_diferentes
FROM vendas 
WHERE user_id IS NULL;

-- 3. Mostrar shop_domains únicos nas vendas
SELECT DISTINCT shop_domain, COUNT(*) as vendas
FROM vendas 
WHERE user_id IS NULL
GROUP BY shop_domain
ORDER BY vendas DESC;

-- 4. Atualizar vendas para associar ao primeiro usuário
-- (Substitua pelo UUID do seu usuário se necessário)
DO $$
DECLARE
    first_user_id UUID;
    updated_count INTEGER;
BEGIN
    -- Pegar o primeiro usuário
    SELECT id INTO first_user_id 
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    IF first_user_id IS NULL THEN
        RAISE EXCEPTION 'Nenhum usuário encontrado. Faça login primeiro na aplicação.';
    END IF;
    
    -- Atualizar todas as vendas sem user_id
    UPDATE vendas 
    SET user_id = first_user_id 
    WHERE user_id IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RAISE NOTICE 'Usuário usado: %', first_user_id;
    RAISE NOTICE 'Vendas atualizadas: %', updated_count;
    
    -- Mostrar resultado
    RAISE NOTICE 'Todas as vendas agora têm user_id configurado!';
END $$;

-- 5. Verificar resultado
SELECT 
    'Resultado:' as info,
    COUNT(*) as total_vendas,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as vendas_com_user,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as vendas_sem_user
FROM vendas;