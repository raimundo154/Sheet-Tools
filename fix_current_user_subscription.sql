-- ========================================
-- CORRIGIR SUBSCRIPTION DO USER ATUAL
-- ========================================

-- PROBLEMA: User pagou Beginner mas continua a mostrar Free Trial
-- CAUSA: Webhook cancelou trial mas não removeu da base de dados

-- 1. VERIFICAR ESTADO ATUAL
SELECT 
  us.id,
  us.user_id,
  sp.name as plan_name,
  us.status,
  us.stripe_subscription_id,
  us.created_at,
  us.canceled_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = 'c0e9d260-24ee-45a5-b6c5-e877dca5aeda'  -- User emmasevilhainfo@gmail.com
ORDER BY us.created_at DESC;

-- 2. REMOVER TRIALS CANCELADOS
DELETE FROM user_subscriptions 
WHERE user_id = 'c0e9d260-24ee-45a5-b6c5-e877dca5aeda'
  AND status = 'canceled'
  AND stripe_subscription_id IS NULL;  -- Trials não têm stripe_subscription_id

-- 3. VERIFICAR SE FICOU SÓ COM SUBSCRIPTION ATIVA
SELECT 
  us.id,
  us.user_id,
  sp.name as plan_name,
  us.status,
  us.stripe_subscription_id,
  us.created_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = 'c0e9d260-24ee-45a5-b6c5-e877dca5aeda'
ORDER BY us.created_at DESC;

-- 4. SE AINDA TIVER PROBLEMA, FORÇAR LIMPEZA COMPLETA
-- (Só executar se necessário)

-- Primeiro, guardar a subscription paga mais recente
/*
CREATE TEMP TABLE temp_paid_subscription AS
SELECT *
FROM user_subscriptions 
WHERE user_id = 'c0e9d260-24ee-45a5-b6c5-e877dca5aeda'
  AND status = 'active'
  AND stripe_subscription_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 1;

-- Remover todas as outras subscriptions do user
DELETE FROM user_subscriptions 
WHERE user_id = 'c0e9d260-24ee-45a5-b6c5-e877dca5aeda';

-- Restaurar apenas a subscription paga
INSERT INTO user_subscriptions 
SELECT * FROM temp_paid_subscription;

-- Limpar tabela temporária
DROP TABLE temp_paid_subscription;
*/

-- ✅ RESULTADO ESPERADO:
-- User deve ter apenas 1 subscription ativa (Beginner)
-- Sem trials cancelados na base de dados

-- 🔍 PARA OUTROS USERS COM MESMO PROBLEMA:
-- Substitui 'c0e9d260-24ee-45a5-b6c5-e877dca5aeda' pelo user_id correto
