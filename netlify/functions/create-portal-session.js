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
    const { userId, returnUrl } = JSON.parse(event.body);

    // Validar parâmetros obrigatórios
    if (!userId || !returnUrl) {
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
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id, stripe_subscription_id, status')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subscriptionError || !subscription) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Subscription ativa não encontrada' })
      };
    }

    if (!subscription.stripe_customer_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Customer ID não encontrado' })
      };
    }

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

    // Configurar portal session
    const portalSessionParams = {
      customer: subscription.stripe_customer_id,
      return_url: returnUrl,
      // Configurações do portal
      configuration: {
        business_profile: {
          headline: 'Gerir a tua subscription do Sheet Tools',
        },
        features: {
          payment_method_update: {
            enabled: true,
          },
          subscription_cancel: {
            enabled: true,
            mode: 'at_period_end', // Cancelar no fim do período
            cancellation_reason: {
              enabled: true,
              options: [
                'too_expensive',
                'missing_features',
                'switched_service',
                'unused',
                'other'
              ]
            }
          },
          subscription_update: {
            enabled: true,
            default_allowed_updates: ['price', 'promotion_code'],
            proration_behavior: 'create_prorations'
          },
          invoice_history: {
            enabled: true,
          }
        }
      }
    };

    // Criar portal session
    const portalSession = await stripe.billingPortal.sessions.create(portalSessionParams);

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
