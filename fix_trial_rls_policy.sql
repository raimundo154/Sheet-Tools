-- ========================================
-- CORRIGIR POLÍTICA RLS PARA FREE TRIAL
-- ========================================

-- PROBLEMA: Users não conseguem criar free trial porque só service_role pode inserir em user_subscriptions
-- SOLUÇÃO: Permitir que users criem trials de planos específicos

-- 1. REMOVER POLÍTICA RESTRITIVA ATUAL
DROP POLICY IF EXISTS "user_subscriptions_insert_service" ON "public"."user_subscriptions";

-- 2. CRIAR NOVA POLÍTICA QUE PERMITE TRIAL + SERVICE_ROLE
CREATE POLICY "user_subscriptions_insert_policy" ON "public"."user_subscriptions"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  -- Permitir se for service_role (webhooks do Stripe)
  auth.role() = 'service_role'
  OR
  -- Permitir se for user autenticado criando trial para si próprio
  (
    auth.uid() = user_id 
    AND status = 'trialing'
    AND plan_id IN (
      SELECT id FROM subscription_plans 
      WHERE stripe_price_id = 'price_free_trial' AND billing_period = 'trial'
    )
  )
);

-- 3. PERMITIR USERS ATUALIZAREM SUAS PRÓPRIAS SUBSCRIPTIONS (para cancelar trial)
DROP POLICY IF EXISTS "user_subscriptions_update_service" ON "public"."user_subscriptions";

CREATE POLICY "user_subscriptions_update_policy" ON "public"."user_subscriptions"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  -- Service role pode atualizar tudo (webhooks)
  auth.role() = 'service_role'
  OR
  -- Users podem atualizar suas próprias subscriptions
  auth.uid() = user_id
);

-- 4. CRIAR FUNÇÃO PARA INICIAR TRIAL (mais segura)
CREATE OR REPLACE FUNCTION start_free_trial()
RETURNS TABLE (
  success BOOLEAN,
  subscription_id UUID,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  trial_plan_id UUID;
  existing_subscription_id UUID;
  new_subscription_id UUID;
  trial_end_date TIMESTAMPTZ;
BEGIN
  -- Obter user atual
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Usuário não autenticado';
    RETURN;
  END IF;
  
  -- Verificar se já tem subscription ativa
  SELECT id INTO existing_subscription_id
  FROM user_subscriptions
  WHERE user_id = current_user_id 
    AND status IN ('active', 'trialing');
  
  IF existing_subscription_id IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, existing_subscription_id, 'Já possui uma subscription ativa';
    RETURN;
  END IF;
  
  -- Obter ID do plano de trial
  SELECT id INTO trial_plan_id
  FROM subscription_plans
  WHERE stripe_price_id = 'price_free_trial' 
    AND billing_period = 'trial'
    AND is_active = true;
  
  IF trial_plan_id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Plano de trial não encontrado';
    RETURN;
  END IF;
  
  -- Calcular data de fim do trial (10 dias)
  trial_end_date := NOW() + INTERVAL '10 days';
  
  -- Criar subscription de trial
  INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    trial_start,
    trial_end,
    current_period_start,
    current_period_end,
    cancel_at_period_end
  ) VALUES (
    current_user_id,
    trial_plan_id,
    'trialing',
    NOW(),
    trial_end_date,
    NOW(),
    trial_end_date,
    false
  ) RETURNING id INTO new_subscription_id;
  
  RETURN QUERY SELECT TRUE, new_subscription_id, 'Trial iniciado com sucesso';
END;
$$;

-- 5. COMENTÁRIOS E DOCUMENTAÇÃO
COMMENT ON FUNCTION start_free_trial IS 'Inicia trial gratuito de 10 dias para o user autenticado';

-- ✅ CORREÇÃO APLICADA:
-- 1. Users podem criar trials para si próprios
-- 2. Service role mantém acesso total (webhooks)
-- 3. Função segura para iniciar trial
-- 4. Validações de segurança mantidas

-- 🧪 PARA TESTAR:
-- 1. Executa este SQL no Supabase
-- 2. Testa criação de trial na aplicação
-- 3. Verifica se não há mais erro 403
