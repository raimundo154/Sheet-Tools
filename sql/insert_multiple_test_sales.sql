-- Inserir múltiplas vendas de teste para verificar o layout
-- Execute este SQL no painel do Supabase em: SQL Editor

INSERT INTO vendas (
  order_id,
  produto,
  preco,
  quantidade,
  customer_email,
  customer_name,
  order_number,
  financial_status,
  fulfillment_status,
  currency,
  shop_domain,
  product_image_url
) VALUES 
-- Venda 1 - Produto caro, pago
(
  100001,
  'MacBook Pro 16" M3 Max',
  2899.99,
  1,
  'joao.silva@email.com',
  'João Silva',
  '#ORD-001',
  'paid',
  'fulfilled',
  'EUR',
  'tech-store.myshopify.com',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop&crop=center'
),

-- Venda 2 - Múltiplos itens
(
  100002,
  'iPhone 15 Pro Case',
  39.99,
  3,
  'maria.santos@gmail.com',
  'Maria Santos',
  '#ORD-002',
  'paid',
  'shipped',
  'EUR',
  'tech-store.myshopify.com',
  'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300&h=300&fit=crop&crop=center'
),

-- Venda 3 - Pendente
(
  100003,
  'AirPods Pro (2ª Geração)',
  279.99,
  1,
  'carlos.ferreira@hotmail.com',
  'Carlos Ferreira',
  '#ORD-003',
  'pending',
  'unfulfilled',
  'EUR',
  'tech-store.myshopify.com',
  'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=300&h=300&fit=crop&crop=center'
),

-- Venda 4 - Produto barato, múltiplos
(
  100004,
  'Cabo USB-C para Lightning',
  19.99,
  5,
  'ana.costa@yahoo.com',
  'Ana Costa',
  '#ORD-004',
  'paid',
  'fulfilled',
  'EUR',
  'tech-store.myshopify.com',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center'
),

-- Venda 5 - Produto de moda
(
  100005,
  'T-shirt Premium Organic Cotton',
  45.00,
  2,
  'pedro.oliveira@outlook.com',
  'Pedro Oliveira',
  '#ORD-005',
  'paid',
  'fulfilled',
  'EUR',
  'fashion-store.myshopify.com',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&crop=center'
),

-- Venda 6 - Cliente sem nome
(
  100006,
  'Smartwatch Series 9',
  399.99,
  1,
  'guest@tempmail.com',
  NULL,
  '#ORD-006',
  'partially_paid',
  'unfulfilled',
  'EUR',
  'tech-store.myshopify.com',
  'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=300&h=300&fit=crop&crop=center'
),

-- Venda 7 - Reembolsada
(
  100007,
  'Headphones Bluetooth Premium',
  149.99,
  1,
  'rita.mendes@email.pt',
  'Rita Mendes',
  '#ORD-007',
  'refunded',
  'returned',
  'EUR',
  'tech-store.myshopify.com',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop&crop=center'
),

-- Venda 8 - Produto físico + digital
(
  100008,
  'Curso Online + Certificado Físico',
  199.00,
  1,
  'student@universidade.pt',
  'Estudante Universitário',
  '#ORD-008',
  'paid',
  'partially_fulfilled',
  'EUR',
  'education-store.myshopify.com',
  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop&crop=center'
),

-- Venda 9 - Venda internacional (USD)
(
  100009,
  'Vintage Vinyl Record Collection',
  89.99,
  3,
  'collector@music.com',
  'Music Collector',
  '#ORD-009',
  'paid',
  'fulfilled',
  'USD',
  'music-store.myshopify.com',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center'
),

-- Venda 10 - Produto com nome longo
(
  100010,
  'Kit Completo de Ferramentas Profissionais para Reparação de Dispositivos Eletrônicos - Edição Limitada',
  299.99,
  1,
  'tecnico@reparacoes.pt',
  'Técnico Especializado',
  '#ORD-010',
  'paid',
  'shipped',
  'EUR',
  'tools-store.myshopify.com',
  'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=300&h=300&fit=crop&crop=center'
);

-- Verificar se as inserções foram bem-sucedidas
SELECT 
  'Inseridas com sucesso!' as status,
  COUNT(*) as total_vendas,
  SUM(total) as faturamento_total,
  AVG(total) as ticket_medio
FROM vendas 
WHERE order_id BETWEEN 100001 AND 100010;