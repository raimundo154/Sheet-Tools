-- ========================================
-- ATUALIZAR PLANO FREE TRIAL COM PRICE ID REAL
-- ========================================

-- Teu produto criado no Stripe:
-- Nome: Sheet Tools Basic Free Trial  
-- Price ID: price_1Ry767E0BDn72JpjxU2LAbgI
-- Valor: €14.99/mês
-- Trial: 10 dias (será definido no código)

-- 1. VERIFICAR PLANOS ATUAIS
SELECT 
  id, name, stripe_price_id, price_amount/100.0 as price_euros, 
  trial_days, billing_period, is_active
FROM subscription_plans 
ORDER BY display_order;

-- 2. CRIAR OU ATUALIZAR PLANO DE TRIAL
-- Primeiro, remover plano trial antigo se existir
DELETE FROM subscription_plans 
WHERE trial_days = 10 OR stripe_price_id LIKE '%trial%';

-- Inserir novo plano trial com o Price ID correto
INSERT INTO subscription_plans (
  id, stripe_price_id, name, description, price_amount, currency, 
  billing_period, trial_days, features, is_active, display_order, 
  created_at, updated_at
) VALUES 
('trial-plan-uuid-123e4567-e89b-12d3-a456-426614174000', 
 'price_1Ry767E0BDn72JpjxU2LAbgI', 
 'Basic Trial', 
 'Daily ROAS + Profit Sheet - 10 dias grátis depois €14.99/mês', 
 1499, 
 'EUR', 
 'monthly', 
 10, 
 '["Daily ROAS", "Profit Sheet", "1 loja", "15 campanhas"]', 
 true, 
 0, 
 now(), 
 now());

-- 3. VERIFICAR CONFIGURAÇÃO FINAL
SELECT 
  id, name, stripe_price_id, price_amount/100.0 as price_euros, 
  trial_days, billing_period, features
FROM subscription_plans 
WHERE trial_days = 10;

-- ✅ RESULTADO ESPERADO:
-- 1 plano: "Basic Trial" 
-- Price ID: price_1Ry767E0BDn72JpjxU2LAbgI
-- €14.99/mês com 10 dias trial
-- Features: Daily ROAS + Profit Sheet

-- 🚀 TESTE:
-- Depois desta atualização, quando clicares "Free Trial":
-- 1. Vai para Stripe Checkout
-- 2. Mostra "10 dias grátis, depois €14.99/mês"  
-- 3. Cobra €0 hoje
-- 4. Após 10 dias cobra €14.99 automaticamente
