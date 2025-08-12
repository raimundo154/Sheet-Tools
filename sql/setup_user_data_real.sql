-- Setup de dados com usuários reais
-- Execute este SQL no painel do Supabase em: SQL Editor

-- 1. Primeiro, vamos ver quais usuários existem
SELECT 
    'Usuários existentes:' as info,
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;

-- 2. Se não houver usuários, você precisa se registrar primeiro no app
-- Caso contrário, vamos usar o primeiro usuário encontrado para os testes

-- 3. Inserir dados de exemplo usando o primeiro usuário encontrado
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Buscar o primeiro usuário
    SELECT id INTO first_user_id 
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- Se não encontrou usuário, abortar
    IF first_user_id IS NULL THEN
        RAISE EXCEPTION 'Nenhum usuário encontrado. Registre-se primeiro no aplicativo.';
    END IF;
    
    -- Mostrar qual usuário será usado
    RAISE NOTICE 'Usando usuário: %', first_user_id;
    
    -- Inserir lojas de teste para este usuário
    INSERT INTO user_shops (user_id, shop_domain, shop_name, is_active) VALUES
    (first_user_id, 'tech-store.myshopify.com', 'Tech Store', true),
    (first_user_id, 'fashion-store.myshopify.com', 'Fashion Store', true),
    (first_user_id, 'music-store.myshopify.com', 'Music Store', true)
    ON CONFLICT (shop_domain) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        shop_name = EXCLUDED.shop_name,
        is_active = EXCLUDED.is_active;
    
    -- Inserir vendas de teste para este usuário
    INSERT INTO vendas (
        order_id, produto, preco, quantidade, customer_email, customer_name,
        order_number, financial_status, fulfillment_status, currency,
        shop_domain, product_image_url, user_id
    ) VALUES 
    -- Tech Store
    (
        300001, 'MacBook Pro 16" M3 Max', 2899.99, 1,
        'joao.silva@email.com', 'João Silva', '#ORD-001',
        'paid', 'fulfilled', 'EUR', 'tech-store.myshopify.com',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop&crop=center',
        first_user_id
    ),
    (
        300002, 'iPhone 15 Pro Case', 39.99, 3,
        'maria.santos@gmail.com', 'Maria Santos', '#ORD-002',
        'paid', 'shipped', 'EUR', 'tech-store.myshopify.com',
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300&h=300&fit=crop&crop=center',
        first_user_id
    ),
    (
        300003, 'AirPods Pro (2ª Geração)', 279.99, 1,
        'carlos.ferreira@hotmail.com', 'Carlos Ferreira', '#ORD-003',
        'pending', 'unfulfilled', 'EUR', 'tech-store.myshopify.com',
        'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=300&h=300&fit=crop&crop=center',
        first_user_id
    ),
    -- Fashion Store
    (
        300004, 'T-shirt Premium Organic Cotton', 45.00, 2,
        'pedro.oliveira@outlook.com', 'Pedro Oliveira', '#ORD-004',
        'paid', 'fulfilled', 'EUR', 'fashion-store.myshopify.com',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&crop=center',
        first_user_id
    ),
    (
        300005, 'Jeans Premium Denim', 89.99, 1,
        'ana.costa@yahoo.com', 'Ana Costa', '#ORD-005',
        'paid', 'fulfilled', 'EUR', 'fashion-store.myshopify.com',
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop&crop=center',
        first_user_id
    ),
    -- Music Store
    (
        300006, 'Vintage Vinyl Record Collection', 89.99, 3,
        'collector@music.com', 'Music Collector', '#ORD-006',
        'paid', 'fulfilled', 'USD', 'music-store.myshopify.com',
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center',
        first_user_id
    )
    ON CONFLICT (order_id) DO NOTHING; -- Evitar duplicatas se executar novamente
    
    -- Mostrar resultados
    RAISE NOTICE 'Setup completo para usuário %', first_user_id;
    
END $$;

-- 4. Verificar os dados inseridos
SELECT 
    'Resumo dos dados inseridos:' as info,
    COUNT(*) as total_vendas,
    SUM(total) as faturamento_total,
    COUNT(DISTINCT shop_domain) as lojas_configuradas
FROM vendas v
JOIN user_shops us ON v.shop_domain = us.shop_domain
WHERE v.order_id BETWEEN 300001 AND 300006;

-- 5. Ver vendas por loja
SELECT 
    us.shop_name,
    COUNT(v.*) as vendas,
    SUM(v.total) as faturamento
FROM user_shops us
LEFT JOIN vendas v ON us.shop_domain = v.shop_domain
WHERE us.is_active = true
GROUP BY us.shop_name
ORDER BY faturamento DESC NULLS LAST;