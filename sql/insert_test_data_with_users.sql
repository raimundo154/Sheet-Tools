-- Inserir dados de teste com user_id para testar controle de acesso
-- Execute este SQL no painel do Supabase em: SQL Editor

-- 1. Primeiro, obter ou criar usuários de teste
-- IMPORTANTE: Substitua os UUIDs pelos UUIDs reais dos seus usuários
-- Para obter: SELECT id, email FROM auth.users;

-- Vamos usar UUIDs de exemplo - você deve substituir pelos reais
DO $$
DECLARE
    user1_id UUID := '11111111-1111-1111-1111-111111111111';
    user2_id UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
    -- 2. Inserir/atualizar user_shops (associar usuários às lojas)
    INSERT INTO user_shops (user_id, shop_domain, shop_name, is_active) VALUES
    (user1_id, 'tech-store.myshopify.com', 'Tech Store User 1', true),
    (user1_id, 'fashion-store.myshopify.com', 'Fashion Store User 1', true),
    (user2_id, 'music-store.myshopify.com', 'Music Store User 2', true),
    (user2_id, 'tools-store.myshopify.com', 'Tools Store User 2', true)
    ON CONFLICT (shop_domain) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        shop_name = EXCLUDED.shop_name,
        is_active = EXCLUDED.is_active;

    -- 3. Inserir vendas para User 1 (Tech Store)
    INSERT INTO vendas (
        order_id, produto, preco, quantidade, customer_email, customer_name,
        order_number, financial_status, fulfillment_status, currency,
        shop_domain, product_image_url, user_id
    ) VALUES 
    (
        200001, 'MacBook Pro 16" M3 Max', 2899.99, 1,
        'joao.silva@email.com', 'João Silva', '#ORD-001',
        'paid', 'fulfilled', 'EUR', 'tech-store.myshopify.com',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop&crop=center',
        user1_id
    ),
    (
        200002, 'iPhone 15 Pro Case', 39.99, 3,
        'maria.santos@gmail.com', 'Maria Santos', '#ORD-002',
        'paid', 'shipped', 'EUR', 'tech-store.myshopify.com',
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300&h=300&fit=crop&crop=center',
        user1_id
    ),
    
    -- 4. Inserir vendas para User 1 (Fashion Store)
    (
        200003, 'T-shirt Premium Organic Cotton', 45.00, 2,
        'pedro.oliveira@outlook.com', 'Pedro Oliveira', '#ORD-003',
        'paid', 'fulfilled', 'EUR', 'fashion-store.myshopify.com',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&crop=center',
        user1_id
    ),
    
    -- 5. Inserir vendas para User 2 (Music Store)
    (
        200004, 'Vintage Vinyl Record Collection', 89.99, 3,
        'collector@music.com', 'Music Collector', '#ORD-004',
        'paid', 'fulfilled', 'USD', 'music-store.myshopify.com',
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center',
        user2_id
    ),
    (
        200005, 'Headphones Bluetooth Premium', 149.99, 1,
        'rita.mendes@email.pt', 'Rita Mendes', '#ORD-005',
        'refunded', 'returned', 'EUR', 'music-store.myshopify.com',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop&crop=center',
        user2_id
    ),
    
    -- 6. Inserir vendas para User 2 (Tools Store)
    (
        200006, 'Kit Ferramentas Profissionais', 299.99, 1,
        'tecnico@reparacoes.pt', 'Técnico Especializado', '#ORD-006',
        'paid', 'shipped', 'EUR', 'tools-store.myshopify.com',
        'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=300&h=300&fit=crop&crop=center',
        user2_id
    );

END $$;

-- 7. Verificar se os dados foram inseridos corretamente
SELECT 
    'Dados de teste inseridos!' as status,
    COUNT(*) as total_vendas,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(DISTINCT shop_domain) as lojas_unicas
FROM vendas 
WHERE order_id BETWEEN 200001 AND 200006;

-- 8. Ver resumo por usuário
SELECT 
    v.user_id,
    us.shop_name,
    COUNT(*) as vendas,
    SUM(v.total) as faturamento_total
FROM vendas v
JOIN user_shops us ON v.shop_domain = us.shop_domain
WHERE v.order_id BETWEEN 200001 AND 200006
GROUP BY v.user_id, us.shop_name
ORDER BY v.user_id;