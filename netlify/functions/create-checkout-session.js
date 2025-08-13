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
    const { planId, stripePriceId, successUrl, cancelUrl, customerEmail, userId } = JSON.parse(event.body);

    // Validar parâmetros obrigatórios
    if (!planId || !stripePriceId || !successUrl || !cancelUrl || !customerEmail || !userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Parâmetros obrigatórios em falta' })
      };
    }

    // Verificar se usuário existe no Supabase
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Usuário não encontrado' })
      };
    }

    // Buscar plano na base de dados
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Plano não encontrado ou não ativo' })
      };
    }

    // Verificar se stripe_price_id corresponde
    if (plan.stripe_price_id !== stripePriceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Price ID não corresponde ao plano' })
      };
    }

    // Criar ou obter customer no Stripe
    let customer;
    try {
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      });
      
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        
        // Atualizar metadata se necessário
        if (customer.metadata.userId !== userId) {
          customer = await stripe.customers.update(customer.id, {
            metadata: { userId }
          });
        }
      } else {
        customer = await stripe.customers.create({
          email: customerEmail,
          metadata: { userId }
        });
      }
    } catch (error) {
      console.error('Erro ao criar/obter customer:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Erro ao processar customer' })
      };
    }

    // Verificar se já tem subscription ativa
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (existingSubscription) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Já possui uma subscription ativa' })
      };
    }

    // Configurar parâmetros da session baseado no tipo de plano
    const sessionParams = {
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{
        price: stripePriceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
        userEmail: customerEmail
      },
      subscription_data: {
        metadata: {
          userId,
          planId,
          userEmail: customerEmail
        }
      },
      // Permitir códigos promocionais
      allow_promotion_codes: true,
      // Configurar trial se aplicável
      ...(plan.trial_days > 0 && {
        subscription_data: {
          ...sessionParams.subscription_data,
          trial_period_days: plan.trial_days
        }
      })
    };

    // Criar checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      })
    };

  } catch (error) {
    console.error('Erro ao criar checkout session:', error);
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
