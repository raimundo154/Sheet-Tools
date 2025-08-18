const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    console.log('🚀 SIMPLE CHECKOUT - Starting...');
    console.log('📥 Request body:', event.body);
    
    const { planId, stripePriceId, successUrl, cancelUrl, customerEmail, userId } = JSON.parse(event.body);

    console.log('📊 Parameters:', {
      planId,
      stripePriceId,
      successUrl,
      cancelUrl,
      customerEmail,
      userId
    });

    // Validar parâmetros básicos
    if (!stripePriceId || !successUrl || !cancelUrl || !customerEmail) {
      console.error('❌ Missing required parameters');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    console.log('✅ Parameters validated');

    // Verificar se Stripe está configurado
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ Stripe secret key not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Stripe not configured' })
      };
    }

    console.log('✅ Stripe configured');

    // Criar customer simples
    let customer;
    try {
      console.log('🔍 Creating/finding customer...');
      
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      });
      
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        console.log('✅ Existing customer found:', customer.id);
      } else {
        customer = await stripe.customers.create({
          email: customerEmail,
          metadata: { userId: userId || 'unknown' }
        });
        console.log('✅ New customer created:', customer.id);
      }
    } catch (error) {
      console.error('❌ Error with customer:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Customer error: ' + error.message })
      };
    }

    // Criar checkout session simples
    try {
      console.log('💳 Creating checkout session...');
      
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
        allow_promotion_codes: true,
        metadata: {
          userId: userId || 'unknown',
          planId: planId || 'unknown',
          userEmail: customerEmail
        },
        subscription_data: {
          metadata: {
            userId: userId || 'unknown',
            planId: planId || 'unknown',
            userEmail: customerEmail
          }
        }
      };

      console.log('📋 Session params:', sessionParams);

      const session = await stripe.checkout.sessions.create(sessionParams);

      console.log('✅ Checkout session created:', session.id);
      console.log('🔗 Redirect URL:', session.url);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          sessionId: session.id,
          url: session.url 
        })
      };

    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Checkout error: ' + error.message,
          details: error.toString()
        })
      };
    }

  } catch (error) {
    console.error('❌ General error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error: ' + error.message,
        details: error.toString()
      })
    };
  }
};
