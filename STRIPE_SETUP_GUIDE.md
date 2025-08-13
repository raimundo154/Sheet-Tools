# 🔥 Guia Completo de Configuração do Stripe - Sheet Tools

Este guia irá orientá-lo passo-a-passo para configurar completamente o Stripe na aplicação Sheet Tools, incluindo produtos, preços, webhooks e integração completa.

## 📋 Índice
1. [Configuração Inicial do Stripe](#1-configuração-inicial-do-stripe)
2. [Criação dos Produtos e Preços](#2-criação-dos-produtos-e-preços)
3. [Configuração das Variáveis de Ambiente](#3-configuração-das-variáveis-de-ambiente)
4. [Funções Serverless Netlify](#4-funções-serverless-netlify)
5. [Configuração de Webhooks](#5-configuração-de-webhooks)
6. [Setup da Base de Dados](#6-setup-da-base-de-dados)
7. [Testes e Validação](#7-testes-e-validação)

---

## 1. Configuração Inicial do Stripe

### 1.1 Criar Conta Stripe
1. Acesse [https://stripe.com](https://stripe.com)
2. Crie uma conta ou faça login
3. Ative o modo de **Teste** (toggle no canto inferior esquerdo)

### 1.2 Obter Chaves da API
1. No Dashboard do Stripe, vá em **Developers > API keys**
2. Anote as seguintes chaves:
   - **Publishable key** (começa com `pk_test_`)
   - **Secret key** (começa com `sk_test_`)

---

## 2. Criação dos Produtos e Preços

### 2.1 Criar Produtos no Stripe Dashboard

Vá em **Products** no Stripe Dashboard e crie os seguintes produtos:

#### Produto 1: Sheet Tools Basic
- **Nome:** Sheet Tools Basic
- **Descrição:** Daily ROAS Profit Sheet e Quotation

#### Produto 2: Sheet Tools Standard  
- **Nome:** Sheet Tools Standard
- **Descrição:** Daily ROAS Profit Sheet, Quotation e Campaigns

#### Produto 3: Sheet Tools Expert
- **Nome:** Sheet Tools Expert
- **Descrição:** Daily ROAS Profit Sheet, Quotation, Campaigns e Product Research

### 2.2 Criar Preços para Cada Produto

Para cada produto criado, adicione os seguintes preços:

#### Sheet Tools Basic
1. **Preço Mensal:**
   - Valor: €14.99
   - Recorrência: Mensal
   - **Anote o Price ID:** `price_xxxxx` (será algo como `price_1234567890`)

2. **Preço Anual:**
   - Valor: €134.91
   - Recorrência: Anual
   - **Anote o Price ID:** `price_xxxxx`

#### Sheet Tools Standard
1. **Preço Mensal:**
   - Valor: €34.99
   - Recorrência: Mensal
   - **Anote o Price ID:** `price_xxxxx`

2. **Preço Anual:**
   - Valor: €314.91
   - Recorrência: Anual
   - **Anote o Price ID:** `price_xxxxx`

#### Sheet Tools Expert
1. **Preço Mensal:**
   - Valor: €49.99
   - Recorrência: Mensal
   - **Anote o Price ID:** `price_xxxxx`

2. **Preço Anual:**
   - Valor: €449.91
   - Recorrência: Anual
   - **Anote o Price ID:** `price_xxxxx`

---

## 3. Configuração das Variáveis de Ambiente

### 3.1 Atualizar arquivo .env (Desenvolvimento)
```bash
# Adicionar ao arquivo .env na raiz do projeto:

# Stripe Configuration
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_sua_chave_publica_aqui
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_aqui
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui
```

### 3.2 Configurar no Netlify (Produção)
1. Acesse o dashboard do Netlify
2. Vá em **Site settings > Environment variables**
3. Adicione as seguintes variáveis:

```
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_sua_chave_publica_de_producao
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_de_producao
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_de_producao
```

---

## 4. Funções Serverless Netlify

### 4.1 Criar as Funções Necessárias

Crie os seguintes arquivos na pasta `netlify/functions/`:

#### 4.1.1 create-checkout-session.js
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { planId, stripePriceId, successUrl, cancelUrl, customerEmail, userId } = JSON.parse(event.body);

    // Criar customer no Stripe se não existir
    let customer;
    try {
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      });
      
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: customerEmail,
          metadata: { userId }
        });
      }
    } catch (error) {
      console.error('Erro ao criar customer:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erro ao criar customer' })
      };
    }

    // Criar checkout session
    const session = await stripe.checkout.sessions.create({
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
        planId
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id })
    };
  } catch (error) {
    console.error('Erro ao criar checkout session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

#### 4.1.2 create-portal-session.js
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { userId, returnUrl } = JSON.parse(event.body);

    // Buscar subscription do usuário
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!subscription?.stripe_customer_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Subscription não encontrada' })
      };
    }

    // Criar portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: portalSession.url })
    };
  } catch (error) {
    console.error('Erro ao criar portal session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

#### 4.1.3 stripe-webhook.js
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
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
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;
      
      default:
        console.log(`Unhandled event type ${stripeEvent.type}`);
    }

    return { statusCode: 200, body: 'Success' };
  } catch (error) {
    console.error('Webhook handler error:', error);
    return { statusCode: 500, body: 'Webhook handler failed' };
  }
};

async function handleCheckoutCompleted(session) {
  const { customer, subscription, metadata } = session;
  
  if (!metadata?.userId || !metadata?.planId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Buscar detalhes da subscription
  const stripeSubscription = await stripe.subscriptions.retrieve(subscription);
  
  // Buscar plano na base de dados
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', metadata.planId)
    .single();

  if (!plan) {
    console.error('Plan not found:', metadata.planId);
    return;
  }

  // Criar subscription na base de dados
  await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: metadata.userId,
      plan_id: metadata.planId,
      stripe_customer_id: customer,
      stripe_subscription_id: subscription,
      status: stripeSubscription.status,
      current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
    }, { onConflict: 'stripe_subscription_id' });
}

async function handlePaymentSucceeded(invoice) {
  const { customer, subscription, amount_paid, currency } = invoice;
  
  // Buscar subscription na base de dados
  const { data: userSubscription } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription)
    .single();

  if (userSubscription) {
    // Registrar pagamento
    await supabase
      .from('payment_history')
      .insert({
        user_id: userSubscription.user_id,
        stripe_invoice_id: invoice.id,
        amount: amount_paid,
        currency,
        status: 'succeeded',
        description: `Pagamento de subscription`
      });
  }
}

async function handleSubscriptionUpdated(subscription) {
  const { id, status, current_period_start, current_period_end, cancel_at_period_end } = subscription;
  
  await supabase
    .from('user_subscriptions')
    .update({
      status,
      current_period_start: new Date(current_period_start * 1000).toISOString(),
      current_period_end: new Date(current_period_end * 1000).toISOString(),
      cancel_at_period_end
    })
    .eq('stripe_subscription_id', id);
}

async function handleSubscriptionDeleted(subscription) {
  const { id } = subscription;
  
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', id);
}
```

### 4.2 Instalar Dependências das Funções
```bash
cd netlify/functions
npm init -y
npm install stripe @supabase/supabase-js
```

---

## 5. Configuração de Webhooks

### 5.1 Configurar Webhook no Stripe
1. No Stripe Dashboard, vá em **Developers > Webhooks**
2. Clique em **Add endpoint**
3. **URL do endpoint:** `https://seudominio.com/.netlify/functions/stripe-webhook`
4. **Eventos para escutar:**
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Clique em **Add endpoint**
6. **Copie o Webhook Secret** (começa com `whsec_`)

### 5.2 Testar Webhook Localmente
```bash
# Instalar Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Windows: https://github.com/stripe/stripe-cli/releases

# Login
stripe login

# Redirecionar eventos para função local
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook
```

---

## 6. Setup da Base de Dados

### 6.1 Executar SQL no Supabase
1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute o arquivo `sql/create_subscription_tables.sql`

### 6.2 Atualizar Price IDs
Após criar os produtos no Stripe, atualize os `stripe_price_id` na tabela `subscription_plans`:

```sql
-- Atualizar com os Price IDs reais do Stripe
UPDATE subscription_plans SET stripe_price_id = 'price_seu_id_real_aqui' WHERE name = 'Basic' AND billing_period = 'monthly';
UPDATE subscription_plans SET stripe_price_id = 'price_seu_id_real_aqui' WHERE name = 'Basic Anual';
-- Repetir para todos os planos...
```

---

## 7. Testes e Validação

### 7.1 Cartões de Teste
Use estes cartões para testes:
- **Sucesso:** 4242 4242 4242 4242
- **Falha:** 4000 0000 0000 0002
- **3D Secure:** 4000 0027 6000 3184

### 7.2 Fluxo de Teste Completo
1. Acesse `/subscription`
2. Selecione um plano
3. Complete o checkout
4. Verifique se a subscription foi criada no Supabase
5. Teste o portal de gestão
6. Teste cancelamento

### 7.3 Verificações Importantes
- [ ] Produtos criados no Stripe
- [ ] Preços configurados corretamente
- [ ] Webhooks funcionando
- [ ] Funções serverless deployadas
- [ ] Base de dados atualizada
- [ ] Variáveis de ambiente configuradas
- [ ] Testes com cartões de teste passando

---

## 🚀 Modo Produção

### Ativar Modo Live
1. No Stripe Dashboard, mude para modo **Live**
2. Obtenha novas chaves (`pk_live_` e `sk_live_`)
3. Atualize as variáveis de ambiente no Netlify
4. Configure webhook para domínio de produção
5. Teste com transações reais pequenas

### Configurações Adicionais
- Configurar métodos de pagamento (CartÔn, MB Way, etc.)
- Configurar impostos se necessário
- Configurar faturas automáticas
- Configurar portal do cliente em português

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique logs das funções no Netlify
2. Verifique eventos no Stripe Dashboard
3. Verifique webhooks no Stripe Dashboard
4. Consulte documentação do Stripe: [https://stripe.com/docs](https://stripe.com/docs)

**✅ Configuração completa! O sistema de subscription está pronto para uso.**
