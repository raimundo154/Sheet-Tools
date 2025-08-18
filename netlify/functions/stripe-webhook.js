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
    'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: 'Method Not Allowed' 
    };
  }

  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { 
      statusCode: 400, 
      headers,
      body: `Webhook Error: ${err.message}` 
    };
  }

  console.log('Received webhook event:', stripeEvent.type);

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(stripeEvent.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return { 
      statusCode: 200, 
      headers,
      body: JSON.stringify({ received: true, type: stripeEvent.type })
    };
  } catch (error) {
    console.error('Webhook handler error:', error);
    return { 
      statusCode: 500, 
      headers,
      body: `Webhook handler failed: ${error.message}` 
    };
  }
};

// Handler para checkout completado
async function handleCheckoutCompleted(session) {
  console.log('Processing checkout.session.completed:', session.id);
  
  const { customer, subscription, metadata, mode } = session;
  
  if (mode !== 'subscription' || !subscription) {
    console.log('Not a subscription checkout, skipping');
    return;
  }

  if (!metadata?.userId || !metadata?.planId) {
    console.error('Missing metadata in checkout session:', metadata);
    return;
  }

  try {
    // Buscar detalhes da subscription no Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription);
    
    // Buscar plano na base de dados
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', metadata.planId)
      .single();

    if (planError || !plan) {
      console.error('Plan not found:', metadata.planId, planError);
      return;
    }

    // Função helper para converter timestamp do Stripe (com validação)
    const convertStripeTimestamp = (timestamp) => {
      if (!timestamp) return null;
      
      // Validar se o timestamp é razoável (entre 2020 e 2030)
      const minTimestamp = new Date('2020-01-01').getTime() / 1000;
      const maxTimestamp = new Date('2030-01-01').getTime() / 1000;
      
      if (timestamp < minTimestamp || timestamp > maxTimestamp) {
        console.warn(`Invalid timestamp detected: ${timestamp}, using current time instead`);
        return new Date().toISOString();
      }
      
      return new Date(timestamp * 1000).toISOString();
    };

    // Criar ou atualizar subscription na base de dados
    const subscriptionData = {
      user_id: metadata.userId,
      plan_id: metadata.planId,
      stripe_customer_id: customer,
      stripe_subscription_id: subscription,
      status: stripeSubscription.status,
      current_period_start: convertStripeTimestamp(stripeSubscription.current_period_start),
      current_period_end: convertStripeTimestamp(stripeSubscription.current_period_end),
      cancel_at_period_end: stripeSubscription.cancel_at_period_end || false
    };

    // Adicionar dados de trial se existir
    if (stripeSubscription.trial_start && stripeSubscription.trial_end) {
      subscriptionData.trial_start = convertStripeTimestamp(stripeSubscription.trial_start);
      subscriptionData.trial_end = convertStripeTimestamp(stripeSubscription.trial_end);
    }

    // Cancelar trial existente se houver
    if (metadata.userId) {
      console.log('🔄 Verificando se há trial para cancelar...');
      const { data: existingTrial } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', metadata.userId)
        .eq('status', 'trialing')
        .single();

      if (existingTrial) {
        console.log('❌ Cancelando trial existente:', existingTrial.id);
        await supabase
          .from('user_subscriptions')
          .update({ 
            status: 'canceled',
            canceled_at: new Date().toISOString()
          })
          .eq('id', existingTrial.id);
      }
    }

    const { error: upsertError } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptionData, { 
        onConflict: 'stripe_subscription_id',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      console.error('Error upserting subscription:', upsertError);
      return;
    }

    console.log('Subscription created/updated successfully:', subscription);

  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error);
    throw error;
  }
}

// Handler para pagamento bem-sucedido
async function handlePaymentSucceeded(invoice) {
  console.log('Processing invoice.payment_succeeded:', invoice.id);
  
  const { customer, subscription, amount_paid, currency, billing_reason, number } = invoice;
  
  if (!subscription) {
    console.log('Invoice not related to subscription, skipping');
    return;
  }

  try {
    // Buscar subscription na base de dados
    const { data: userSubscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('user_id, id')
      .eq('stripe_subscription_id', subscription)
      .single();

    if (subscriptionError || !userSubscription) {
      console.error('Subscription not found in database:', subscription, subscriptionError);
      return;
    }

    // Registrar pagamento no histórico
    const paymentData = {
      user_id: userSubscription.user_id,
      subscription_id: userSubscription.id,
      stripe_invoice_id: invoice.id,
      amount: amount_paid,
      currency: currency.toUpperCase(),
      status: 'succeeded',
      payment_method: 'card', // Pode ser melhorado para detectar método real
      description: `Pagamento ${billing_reason === 'subscription_create' ? 'inicial' : 'recorrente'} - Fatura ${number}`
    };

    const { error: paymentError } = await supabase
      .from('payment_history')
      .insert(paymentData);

    if (paymentError) {
      console.error('Error inserting payment history:', paymentError);
      return;
    }

    console.log('Payment recorded successfully:', invoice.id);

  } catch (error) {
    console.error('Error in handlePaymentSucceeded:', error);
    throw error;
  }
}

// Handler para falha de pagamento
async function handlePaymentFailed(invoice) {
  console.log('Processing invoice.payment_failed:', invoice.id);
  
  const { customer, subscription, amount_due, currency, number } = invoice;
  
  if (!subscription) {
    console.log('Invoice not related to subscription, skipping');
    return;
  }

  try {
    // Buscar subscription na base de dados
    const { data: userSubscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('user_id, id')
      .eq('stripe_subscription_id', subscription)
      .single();

    if (subscriptionError || !userSubscription) {
      console.error('Subscription not found in database:', subscription, subscriptionError);
      return;
    }

    // Registrar tentativa de pagamento falhada
    const paymentData = {
      user_id: userSubscription.user_id,
      subscription_id: userSubscription.id,
      stripe_invoice_id: invoice.id,
      amount: amount_due,
      currency: currency.toUpperCase(),
      status: 'failed',
      description: `Falha no pagamento - Fatura ${number}`
    };

    const { error: paymentError } = await supabase
      .from('payment_history')
      .insert(paymentData);

    if (paymentError) {
      console.error('Error inserting failed payment:', paymentError);
    }

    console.log('Failed payment recorded:', invoice.id);

  } catch (error) {
    console.error('Error in handlePaymentFailed:', error);
    throw error;
  }
}

// Handler para subscription criada
async function handleSubscriptionCreated(subscription) {
  console.log('Processing customer.subscription.created:', subscription.id);
  // Normalmente já tratado em checkout.session.completed
  // Pode ser usado como backup ou para subscriptions criadas fora do checkout
}

// Handler para subscription atualizada
async function handleSubscriptionUpdated(subscription) {
  console.log('Processing customer.subscription.updated:', subscription.id);
  
  const { 
    id, 
    status, 
    current_period_start, 
    current_period_end, 
    cancel_at_period_end,
    canceled_at,
    trial_start,
    trial_end
  } = subscription;
  
  try {
    // Função helper para converter timestamp do Stripe (com validação)
    const convertStripeTimestamp = (timestamp) => {
      if (!timestamp) return null;
      
      // Validar se o timestamp é razoável (entre 2020 e 2030)
      const minTimestamp = new Date('2020-01-01').getTime() / 1000;
      const maxTimestamp = new Date('2030-01-01').getTime() / 1000;
      
      if (timestamp < minTimestamp || timestamp > maxTimestamp) {
        console.warn(`Invalid timestamp detected: ${timestamp}, using current time instead`);
        return new Date().toISOString();
      }
      
      return new Date(timestamp * 1000).toISOString();
    };

    const updateData = {
      status,
      current_period_start: convertStripeTimestamp(current_period_start),
      current_period_end: convertStripeTimestamp(current_period_end),
      cancel_at_period_end: cancel_at_period_end || false,
      canceled_at: convertStripeTimestamp(canceled_at)
    };

    // Adicionar dados de trial se existir
    if (trial_start && trial_end) {
      updateData.trial_start = convertStripeTimestamp(trial_start);
      updateData.trial_end = convertStripeTimestamp(trial_end);
    }

    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return;
    }

    console.log('Subscription updated successfully:', id);

  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error);
    throw error;
  }
}

// Handler para subscription deletada/cancelada
async function handleSubscriptionDeleted(subscription) {
  console.log('Processing customer.subscription.deleted:', subscription.id);
  
  const { id, canceled_at } = subscription;
  
  try {
    // Função helper para converter timestamp do Stripe (com validação)
    const convertStripeTimestamp = (timestamp) => {
      if (!timestamp) return null;
      
      // Validar se o timestamp é razoável (entre 2020 e 2030)
      const minTimestamp = new Date('2020-01-01').getTime() / 1000;
      const maxTimestamp = new Date('2030-01-01').getTime() / 1000;
      
      if (timestamp < minTimestamp || timestamp > maxTimestamp) {
        console.warn(`Invalid timestamp detected: ${timestamp}, using current time instead`);
        return new Date().toISOString();
      }
      
      return new Date(timestamp * 1000).toISOString();
    };

    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: canceled_at ? convertStripeTimestamp(canceled_at) : new Date().toISOString()
      })
      .eq('stripe_subscription_id', id);

    if (updateError) {
      console.error('Error canceling subscription:', updateError);
      return;
    }

    console.log('Subscription canceled successfully:', id);

  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error);
    throw error;
  }
}

// Handler para aviso de fim de trial
async function handleTrialWillEnd(subscription) {
  console.log('Processing customer.subscription.trial_will_end:', subscription.id);
  
  // Aqui pode implementar notificações por email sobre fim do trial
  // Por exemplo, enviar email avisando que o trial acaba em X dias
  
  const { id, trial_end } = subscription;
  
  // Função helper para converter timestamp do Stripe (com validação)
  const convertStripeTimestamp = (timestamp) => {
    if (!timestamp) return null;
    
    // Validar se o timestamp é razoável (entre 2020 e 2030)
    const minTimestamp = new Date('2020-01-01').getTime() / 1000;
    const maxTimestamp = new Date('2030-01-01').getTime() / 1000;
    
    if (timestamp < minTimestamp || timestamp > maxTimestamp) {
      console.warn(`Invalid timestamp detected: ${timestamp}, using current time instead`);
      return new Date();
    }
    
    return new Date(timestamp * 1000);
  };

  const trialEndDate = convertStripeTimestamp(trial_end);
  const daysLeft = Math.ceil((trialEndDate - new Date()) / (1000 * 60 * 60 * 24));
  
  console.log(`Trial ending in ${daysLeft} days for subscription:`, id);
  
  // TODO: Implementar envio de email de notificação
}
