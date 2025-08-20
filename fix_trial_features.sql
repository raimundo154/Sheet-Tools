-- ========================================
-- CORRIGIR FEATURES DO TRIAL EXISTENTE
-- ========================================

-- PROBLEMA: Trial users não têm acesso a Daily ROAS + Profit Sheet
-- CAUSA: Features do plano trial não coincidem com lógica da app

-- 1. VERIFICAR TRIAL ATUAL E SUAS FEATURES
SELECT 
  us.user_id,
  sp.name as plan_name,
  sp.features,
  us.status,
  us.stripe_customer_id
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'trialing'
ORDER BY us.created_at DESC;

-- 2. ATUALIZAR FEATURES DO PLANO TRIAL
UPDATE subscription_plans 
SET features = '["Daily ROAS básico", "Daily ROAS Profit Sheet", "1 loja", "15 campanhas"]'
WHERE trial_days = 10 
  AND billing_period = 'monthly'
  AND price_amount = 1499;

-- 3. VERIFICAR SE APLICOU CORRETAMENTE
SELECT 
  name,
  features,
  trial_days,
  stripe_price_id
FROM subscription_plans 
WHERE trial_days = 10;

-- 4. FORÇAR REFRESH DAS SUBSCRIPTIONS ATIVAS (opcional)
-- Se necessário, podes fazer update da updated_at para forçar refresh
UPDATE user_subscriptions 
SET updated_at = now()
WHERE status = 'trialing';

-- ✅ RESULTADO ESPERADO:
-- Trial users agora têm:
-- - "Daily ROAS básico" → Acesso à página daily-roas
-- - "Daily ROAS Profit Sheet" → Acesso à página profit-sheet  
-- - Botão "Gerir Subscription" funciona (vai para Stripe Portal)

-- 🔍 VERIFICAÇÃO FINAL:
-- Depois deste script, users em trial devem ter:
-- 1. Acesso a Daily ROAS e Profit Sheet
-- 2. "Gerir Subscription" abre Customer Portal 
-- 3. Podem cancelar/upgrade no Stripe
