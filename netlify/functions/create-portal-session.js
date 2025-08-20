const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    console.log('🔧 create-portal-session - Iniciando...');
    const { userId, returnUrl } = JSON.parse(event.body);
    console.log('📥 Parâmetros recebidos:', { userId, returnUrl });

    // Validar parâmetros obrigatórios
    if (!userId || !returnUrl) {
      console.log('❌ Parâmetros em falta');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Parâmetros obrigatórios em falta' })
      };
    }

    // Verificar se usuário existe
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Usuário não encontrado' })
      };
    }

    // Buscar subscription ativa do usuário
    console.log('🔍 Buscando subscription para user:', userId);
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id, stripe_subscription_id, status')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log('📊 Subscription encontrada:', subscription);
    console.log('❌ Erro na subscription:', subscriptionError);

    if (subscriptionError || !subscription) {
      console.log('❌ Nenhuma subscription ativa encontrada');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Subscription ativa não encontrada' })
      };
    }

    if (!subscription.stripe_customer_id) {
      console.log('❌ Customer ID não encontrado na subscription');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Customer ID não encontrado' })
      };
    }

    console.log('✅ Customer ID encontrado:', subscription.stripe_customer_id);

    // Verificar se customer existe no Stripe
    let customer;
    try {
      customer = await stripe.customers.retrieve(subscription.stripe_customer_id);
      if (customer.deleted) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Customer foi deletado no Stripe' })
        };
      }
    } catch (error) {
      console.error('Erro ao buscar customer no Stripe:', error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Customer não encontrado no Stripe' })
      };
    }

    // Configurar portal session (versão simplificada para test mode)
    console.log('🔧 Criando portal session...');
    const portalSessionParams = {
      customer: subscription.stripe_customer_id,
      return_url: returnUrl
    };

    console.log('📋 Parâmetros do portal:', portalSessionParams);

    // Criar portal session
    console.log('🚀 Chamando Stripe API...');
    const portalSession = await stripe.billingPortal.sessions.create(portalSessionParams);
    console.log('✅ Portal session criado:', portalSession.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        url: portalSession.url,
        sessionId: portalSession.id
      })
    };

  } catch (error) {
    console.error('Erro ao criar portal session:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
