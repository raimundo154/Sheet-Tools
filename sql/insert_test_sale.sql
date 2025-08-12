-- Inserir venda de teste para verificar o layout
-- Execute este SQL no painel do Supabase em: SQL Editor

insert into vendas (
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
  shop_domain
) values (
  999999001,
  'Produto Teste - T-shirt Premium',
  29.99,
  2,
  'teste@exemplo.com',
  'João Silva',
  '#T001',
  'paid',
  'fulfilled',
  'EUR',
  'minha-loja-teste.myshopify.com'
);