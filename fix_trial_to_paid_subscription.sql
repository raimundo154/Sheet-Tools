-- ========================================
-- CORRIGIR TRIAL QUE NÃO FOI CANCELADO
-- ========================================

-- PROBLEMA: User pagou subscription mas trial não foi cancelado automaticamente
-- SOLUÇÃO: Cancelar trial manual e verificar subscription paga

-- 1. ENCONTRAR USER COM PROBLEMA
-- Substitui 'emmasevilhainfo@gmail.com' pelo email do user
DO $$
DECLARE
    user_email TEXT := 'emmasevilhainfo@gmail.com';
    target_user_id UUID;
    trial_subscription_id UUID;
    paid_subscription_id UUID;
BEGIN
    -- Encontrar user_id pelo email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User não encontrado com email: %', user_email;
        RETURN;
    END IF;
    
    RAISE NOTICE 'User encontrado: %', target_user_id;
    
    -- Encontrar trial ativo
    SELECT id INTO trial_subscription_id
    FROM user_subscriptions
    WHERE user_id = target_user_id 
      AND status = 'trialing';
    
    -- Encontrar subscription paga
    SELECT id INTO paid_subscription_id
    FROM user_subscriptions
    WHERE user_id = target_user_id 
      AND status = 'active'
      AND stripe_subscription_id IS NOT NULL;
    
    RAISE NOTICE 'Trial ID: %, Paid ID: %', trial_subscription_id, paid_subscription_id;
    
    -- Se tem trial e subscription paga, cancelar trial
    IF trial_subscription_id IS NOT NULL AND paid_subscription_id IS NOT NULL THEN
        UPDATE user_subscriptions
        SET status = 'canceled',
            canceled_at = NOW()
        WHERE id = trial_subscription_id;
        
        RAISE NOTICE 'Trial cancelado com sucesso: %', trial_subscription_id;
    ELSIF trial_subscription_id IS NOT NULL THEN
        RAISE NOTICE 'Trial encontrado mas nenhuma subscription paga encontrada';
    ELSE
        RAISE NOTICE 'Nenhum trial encontrado para cancelar';
    END IF;
    
    -- Mostrar subscriptions atuais do user
    RAISE NOTICE 'Subscriptions atuais:';
    FOR rec IN 
        SELECT us.id, us.status, sp.name, us.stripe_subscription_id
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.user_id = target_user_id
        ORDER BY us.created_at DESC
    LOOP
        RAISE NOTICE 'ID: %, Status: %, Plano: %, Stripe ID: %', 
                     rec.id, rec.status, rec.name, rec.stripe_subscription_id;
    END LOOP;
    
END $$;

-- ========================================
-- FUNÇÃO PARA CORRIGIR QUALQUER USER
-- ========================================

CREATE OR REPLACE FUNCTION fix_trial_after_payment(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
    trial_count INTEGER;
    paid_count INTEGER;
    result TEXT;
BEGIN
    -- Encontrar user
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RETURN 'User não encontrado: ' || user_email;
    END IF;
    
    -- Contar trials ativos
    SELECT COUNT(*) INTO trial_count
    FROM user_subscriptions
    WHERE user_id = target_user_id AND status = 'trialing';
    
    -- Contar subscriptions pagas ativas
    SELECT COUNT(*) INTO paid_count
    FROM user_subscriptions
    WHERE user_id = target_user_id 
      AND status = 'active' 
      AND stripe_subscription_id IS NOT NULL;
    
    -- Se tem trial e subscription paga, cancelar trial
    IF trial_count > 0 AND paid_count > 0 THEN
        UPDATE user_subscriptions
        SET status = 'canceled',
            canceled_at = NOW()
        WHERE user_id = target_user_id 
          AND status = 'trialing';
          
        result := 'Trial cancelado para user: ' || user_email || '. Trials cancelados: ' || trial_count;
    ELSE
        result := 'Nenhuma correção necessária. Trials: ' || trial_count || ', Pagas: ' || paid_count;
    END IF;
    
    RETURN result;
END;
$$;

-- ========================================
-- EXECUTAR CORREÇÃO
-- ========================================

-- Para corrigir o user específico, execute:
SELECT fix_trial_after_payment('emmasevilhainfo@gmail.com');

-- ✅ DEPOIS DE EXECUTAR:
-- 1. Verifica se o trial foi cancelado
-- 2. User deve ter apenas a subscription paga ativa
-- 3. Aplicação deve mostrar o plano correto
