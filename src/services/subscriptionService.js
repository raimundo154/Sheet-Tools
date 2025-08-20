import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../config/supabase';
import authService from './authService';

class SubscriptionService {
  constructor() {
    this.stripe = null;
    this.stripePromise = null;
    this.initializeStripe();
  }

  // Inicializar Stripe
  async initializeStripe() {
    try {
      // Chave pública do Stripe (será configurada via env)
      const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
      
      console.log('🔑 Stripe Public Key:', stripePublicKey ? 'Configurada' : 'NÃO CONFIGURADA');
      console.log('🔑 Env vars disponíveis:', Object.keys(process.env).filter(key => key.includes('STRIPE')));
      
      if (!stripePublicKey) {
        console.warn('❌ Chave pública do Stripe não configurada');
        return;
      }

      console.log('🚀 Inicializando Stripe...');
      this.stripePromise = loadStripe(stripePublicKey);
      this.stripe = await this.stripePromise;
      console.log('✅ Stripe inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar Stripe:', error);
    }
  }

  // Obter instância do Stripe
  async getStripe() {
    if (!this.stripe && this.stripePromise) {
      this.stripe = await this.stripePromise;
    }
    return this.stripe;
  }

  // Obter todos os planos disponíveis
  async getAvailablePlans() {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        console.error('Erro ao buscar planos:', error);
        throw new Error('Erro ao carregar planos');
      }

      return data || [];
    } catch (error) {
      console.error('Erro no getAvailablePlans:', error);
      throw error;
    }
  }

  // Obter subscription ativa do usuário
  async getUserActiveSubscription() {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .rpc('get_user_active_subscription', { user_uuid: user.id });

      if (error) {
        console.error('Erro ao buscar subscription:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Erro no getUserActiveSubscription:', error);
      return null;
    }
  }

  // Verificar se usuário tem acesso a uma feature
  async userHasFeature(featureName) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .rpc('user_has_feature', { 
          user_uuid: user.id, 
          feature_name: featureName 
        });

      if (error) {
        console.error('Erro ao verificar feature:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Erro no userHasFeature:', error);
      return false;
    }
  }

  // Criar checkout session do Stripe
  async createCheckoutSession(planId, successUrl, cancelUrl) {
    try {
      console.log('🚀 Iniciando createCheckoutSession...');
      
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('👤 User:', user.id, user.email);

      // Obter detalhes do plano
      console.log('📦 Buscando plano ID:', planId);
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError || !plan) {
        console.error('❌ Erro ao buscar plano:', planError);
        throw new Error('Plano não encontrado');
      }

      console.log('✅ Plano encontrado:', plan.name, plan.stripe_price_id);

      // Chamar função serverless para criar checkout session
      const functionsBase = this.getFunctionsBaseUrl();
      const url = functionsBase
        ? `${functionsBase}/.netlify/functions/create-checkout-session`
        : '/.netlify/functions/create-checkout-session';

      console.log('🌐 URL da função:', url);
      console.log('📊 Functions base:', functionsBase);

      const requestBody = {
        planId,
        stripePriceId: plan.stripe_price_id,
        successUrl,
        cancelUrl,
        customerEmail: user.email,
        userId: user.id
      };

      console.log('📤 Enviando request:', requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getCurrentSession()?.access_token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro na response:', errorData);
        throw new Error(errorData.error || 'Erro ao criar checkout session');
      }

      const responseData = await response.json();
      console.log('✅ Response data:', responseData);

      const { sessionId, url: checkoutUrl } = responseData;

      if (checkoutUrl) {
        console.log('🔗 Redirecionando para Stripe URL:', checkoutUrl);
        window.location.href = checkoutUrl;
        return;
      }

      if (!sessionId) {
        throw new Error('SessionId não retornado da função');
      }

      // Redirecionar para o Stripe Checkout
      console.log('💳 Iniciando redirect para Stripe com sessionId:', sessionId);
      const stripe = await this.getStripe();
      if (!stripe) {
        throw new Error('Stripe não está configurado');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        console.error('❌ Erro no redirect:', error);
        throw new Error(error.message);
      }

    } catch (error) {
      console.error('❌ Erro no createCheckoutSession:', error);
      throw error;
    }
  }

  // Criar portal do cliente para gerenciar subscription
  async createCustomerPortalSession(returnUrl) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('🚀 Iniciando customer portal para user:', user.id);

      // Obter subscription ativa
      const subscription = await this.getUserActiveSubscription();
      if (!subscription) {
        throw new Error('Nenhuma subscription ativa encontrada');
      }

      console.log('📊 Subscription encontrada:', subscription);

      // Verificar se é um trial interno (sem customer_id do Stripe)
      if (!subscription.stripe_customer_id) {
        console.log('⚠️ Trial interno detectado - redirecionando para página de upgrade');
        // Para trials internos, redirecionar para página de subscrições
        window.location.href = '/subscription?upgrade=true';
        return;
      }

      // Chamar função serverless para criar portal session
      const functionsBase = this.getFunctionsBaseUrl();
      const url = functionsBase
        ? `${functionsBase}/.netlify/functions/create-portal-session`
        : '/.netlify/functions/create-portal-session';

      console.log('🌐 URL da função portal:', url);

      console.log('📤 Enviando request:', {
        userId: user.id,
        returnUrl,
        hasStripeCustomerId: subscription.stripe_customer_id ? 'SIM' : 'NÃO',
        subscriptionStatus: subscription.status
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getCurrentSession()?.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          returnUrl
        })
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro na response:', errorData);
        throw new Error(errorData.error || 'Erro ao criar portal session');
      }

      const { url: portalUrl } = await response.json();
      console.log('✅ Portal URL obtido:', portalUrl);

      // Redirecionar para o portal
      console.log('🌐 Redirecionando para portal...');
      window.location.href = portalUrl;

    } catch (error) {
      console.error('❌ Erro no createCustomerPortalSession:', error);
      throw error;
    }
  }

  // Iniciar trial gratuito via Stripe Checkout
  async startFreeTrial() {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('🚀 Iniciando free trial via Stripe para user:', user.id);

      // Buscar plano de trial do Stripe (Basic com 10 dias trial)
      const { data: trialPlan, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('trial_days', 10)
        .eq('billing_period', 'monthly')
        .eq('price_amount', 1499)  // Basic plan €14.99
        .single();

      if (error || !trialPlan) {
        console.error('❌ Erro ao buscar plano trial:', error);
        throw new Error('Plano de trial não encontrado');
      }

      console.log('📦 Plano trial encontrado:', trialPlan);

      // Criar checkout session para trial (€0 hoje, €14.99 após 10 dias)
      const checkoutUrl = await this.createCheckoutSession(
        trialPlan.id,
        `${window.location.origin}/dashboard?trial=success`,
        `${window.location.origin}/subscription?trial=cancelled`
      );

      // Redirecionar para Stripe Checkout
      window.location.href = checkoutUrl;
      
      return { success: true, checkout_url: checkoutUrl };
    } catch (error) {
      console.error('❌ Erro no startFreeTrial:', error);
      throw error;
    }
  }

  // Obter histórico de pagamentos
  async getPaymentHistory() {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('payment_history')
        .select(`
          *,
          subscription_id,
          user_subscriptions (
            subscription_plans (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        throw new Error('Erro ao carregar histórico de pagamentos');
      }

      return data || [];
    } catch (error) {
      console.error('Erro no getPaymentHistory:', error);
      throw error;
    }
  }

  // Cancelar subscription (no final do período)
  async cancelSubscription() {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const subscription = await this.getUserActiveSubscription();
      if (!subscription) {
        throw new Error('Nenhuma subscription ativa encontrada');
      }

      // Chamar função serverless para cancelar no Stripe
      const functionsBase = this.getFunctionsBaseUrl();
      const url = functionsBase
        ? `${functionsBase}/.netlify/functions/cancel-subscription`
        : '/.netlify/functions/cancel-subscription';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getCurrentSession()?.access_token}`
        },
        body: JSON.stringify({
          userId: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao cancelar subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro no cancelSubscription:', error);
      throw error;
    }
  }

  // Utilidade para obter base URL das funções
  getFunctionsBaseUrl() {
    const fromEnv = (process.env.REACT_APP_FUNCTIONS_BASE_URL || '').trim();
    if (fromEnv) return fromEnv.replace(/\/$/, '');
    
    try {
      const { hostname, port } = window.location;
      if (hostname === 'localhost') {
        if (port === '3000') return 'http://localhost:8888';
        if (port === '8888') return '';
      }
    } catch (_) {}
    
    return '';
  }

  // Formatação de moeda
  formatPrice(amount, currency = 'EUR') {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount / 100);
  }

  // Calcular desconto anual
  calculateYearlyDiscount(monthlyPrice) {
    const yearlyTotal = monthlyPrice * 12;
    const discountMonths = 3;
    const discount = monthlyPrice * discountMonths;
    const finalPrice = yearlyTotal - discount;
    
    return {
      originalPrice: yearlyTotal,
      discount: discount,
      finalPrice: finalPrice,
      discountPercentage: Math.round((discount / yearlyTotal) * 100)
    };
  }
}

// Exportar instância única (singleton)
export const subscriptionService = new SubscriptionService();
export default subscriptionService;
