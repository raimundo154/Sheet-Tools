-- ==================================================
-- SISTEMA DE SUBSCRIPTION - SHEET TOOLS
-- ==================================================
-- Execute este SQL no SQL Editor do Supabase
-- Criará todas as tabelas necessárias para o sistema de subscription

-- 1. Tabela de Planos
-- ==================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_price_id TEXT UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_amount INTEGER NOT NULL, -- Preço em cêntimos (ex: 1499 = 14.99€)
    currency VARCHAR(3) DEFAULT 'EUR',
    billing_period VARCHAR(20) NOT NULL, -- 'monthly', 'yearly', 'trial'
    trial_days INTEGER DEFAULT 0,
    features TEXT[], -- Array de features incluídas
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Subscriptions dos Usuários
-- ==================================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    status VARCHAR(50) NOT NULL, -- 'active', 'trialing', 'past_due', 'canceled', 'unpaid'
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Histórico de Pagamentos
-- ==================================================
CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT,
    stripe_invoice_id TEXT,
    amount INTEGER NOT NULL, -- Valor em cêntimos
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(50) NOT NULL, -- 'succeeded', 'failed', 'pending', 'refunded'
    payment_method VARCHAR(50), -- 'card', 'sepa_debit', etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Índices para Performance
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_price_id ON public.subscription_plans(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_billing_period ON public.subscription_plans(billing_period);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(is_active);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON public.user_subscriptions(current_period_end);

CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON public.payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON public.payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON public.payment_history(created_at DESC);

-- 5. Trigger para atualizar updated_at
-- ==================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas relevantes
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Row Level Security (RLS)
-- ==================================================
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Políticas para subscription_plans (todos podem ler, apenas admin pode escrever)
CREATE POLICY "Todos podem ver planos ativos" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

-- Políticas para user_subscriptions (usuários só veem suas próprias subscriptions)
CREATE POLICY "Usuários veem suas subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar subscriptions" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas subscriptions" ON public.user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para payment_history (usuários só veem seu histórico)
CREATE POLICY "Usuários veem seu histórico de pagamentos" ON public.payment_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir pagamentos" ON public.payment_history
    FOR INSERT WITH CHECK (true); -- Webhooks precisam inserir

-- Service role pode fazer tudo (para webhooks e admin)
CREATE POLICY "Service role acesso total subscription_plans" ON public.subscription_plans
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role acesso total user_subscriptions" ON public.user_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role acesso total payment_history" ON public.payment_history
    FOR ALL USING (auth.role() = 'service_role');

-- 7. Inserir Planos Base (conforme especificação)
-- ==================================================

-- Plano Free Trial (10 dias)
INSERT INTO public.subscription_plans (
    stripe_price_id, name, description, price_amount, billing_period, trial_days, features, display_order
) VALUES (
    'price_free_trial', 
    'Free Trial', 
    'Experimenta gratuitamente por 10 dias', 
    0, 
    'trial', 
    10, 
    ARRAY['Daily ROAS Profit Sheet', 'Quotation', 'Acesso completo por 10 dias'],
    0
) ON CONFLICT (stripe_price_id) DO NOTHING;

-- ===== PLANOS MENSAIS =====

-- Plano Basic Mensal
INSERT INTO public.subscription_plans (
    stripe_price_id, name, description, price_amount, billing_period, features, display_order
) VALUES (
    'price_1Rvgi4E0BDn72Jpjh34HZRjL', 
    'Basic', 
    'Para quem está começando', 
    1499, 
    'monthly', 
    ARRAY['Daily ROAS Profit Sheet', 'Quotation'],
    1
) ON CONFLICT (stripe_price_id) DO NOTHING;

-- Plano Standard Mensal
INSERT INTO public.subscription_plans (
    stripe_price_id, name, description, price_amount, billing_period, features, display_order
) VALUES (
    'price_1RvgkSE0BDn72JpjofN3giZz', 
    'Standard', 
    'Para quem quer crescer', 
    3499, 
    'monthly', 
    ARRAY['Daily ROAS Profit Sheet', 'Quotation', 'Campaigns'],
    2
) ON CONFLICT (stripe_price_id) DO NOTHING;

-- Plano Expert Mensal
INSERT INTO public.subscription_plans (
    stripe_price_id, name, description, price_amount, billing_period, features, display_order
) VALUES (
    'price_1RvglhE0BDn72Jpj75mciOBg', 
    'Expert', 
    'Para profissionais', 
    4999, 
    'monthly', 
    ARRAY['Daily ROAS Profit Sheet', 'Quotation', 'Campaigns', 'Product Research'],
    3
) ON CONFLICT (stripe_price_id) DO NOTHING;

-- ===== PLANOS ANUAIS (com desconto de 3 meses) =====

-- Plano Basic Anual (179,88 - 44,97 = 134,91€)
INSERT INTO public.subscription_plans (
    stripe_price_id, name, description, price_amount, billing_period, features, display_order
) VALUES (
    'price_1RvgipE0BDn72Jpj8WeScbhs', 
    'Basic Anual', 
    'Poupa 44,97€ por ano', 
    13491, 
    'yearly', 
    ARRAY['Daily ROAS Profit Sheet', 'Quotation', '3 meses grátis'],
    4
) ON CONFLICT (stripe_price_id) DO NOTHING;

-- Plano Standard Anual (419,88 - 104,97 = 314,91€)
INSERT INTO public.subscription_plans (
    stripe_price_id, name, description, price_amount, billing_period, features, display_order
) VALUES (
    'price_1Rvgl7E0BDn72JpjHw0XW1xl', 
    'Standard Anual', 
    'Poupa 104,97€ por ano', 
    31491, 
    'yearly', 
    ARRAY['Daily ROAS Profit Sheet', 'Quotation', 'Campaigns', '3 meses grátis'],
    5
) ON CONFLICT (stripe_price_id) DO NOTHING;

-- Plano Expert Anual (599,88 - 149,97 = 449,91€)
INSERT INTO public.subscription_plans (
    stripe_price_id, name, description, price_amount, billing_period, features, display_order
) VALUES (
    'price_1RvgmJE0BDn72JpjIP1J6mf2', 
    'Expert Anual', 
    'Poupa 149,97€ por ano', 
    44991, 
    'yearly', 
    ARRAY['Daily ROAS Profit Sheet', 'Quotation', 'Campaigns', 'Product Research', '3 meses grátis'],
    6
) ON CONFLICT (stripe_price_id) DO NOTHING;

-- 8. Funções Utilitárias
-- ==================================================

-- Função para obter subscription ativa do usuário
CREATE OR REPLACE FUNCTION get_user_active_subscription(user_uuid UUID)
RETURNS TABLE (
    subscription_id UUID,
    plan_name VARCHAR(100),
    status VARCHAR(50),
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    features TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.id,
        sp.name,
        us.status,
        us.current_period_end,
        us.trial_end,
        sp.features
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = user_uuid
    AND us.status IN ('active', 'trialing')
    ORDER BY us.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário tem acesso a uma feature
CREATE OR REPLACE FUNCTION user_has_feature(user_uuid UUID, feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_features TEXT[];
BEGIN
    SELECT features INTO user_features
    FROM get_user_active_subscription(user_uuid)
    LIMIT 1;
    
    IF user_features IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN feature_name = ANY(user_features);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Comentários para Documentação
-- ==================================================
COMMENT ON TABLE public.subscription_plans IS 'Planos de subscription disponíveis';
COMMENT ON TABLE public.user_subscriptions IS 'Subscriptions ativas dos usuários';
COMMENT ON TABLE public.payment_history IS 'Histórico de pagamentos e transações';

COMMENT ON FUNCTION get_user_active_subscription(UUID) IS 'Retorna a subscription ativa de um usuário';
COMMENT ON FUNCTION user_has_feature(UUID, TEXT) IS 'Verifica se um usuário tem acesso a uma feature específica';

-- ==================================================
-- SETUP COMPLETO!
-- Execute este script completo no SQL Editor do Supabase
-- ==================================================

-- Verificação final
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT COUNT(*) as total_plans FROM public.subscription_plans;
