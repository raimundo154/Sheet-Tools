import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Inicializar cliente Supabase com service role para inserções
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key para operações de webhook
);

// Função para verificar autenticidade do webhook Shopify (opcional mas recomendado)
function verifyShopifyWebhook(data, hmacSignature) {
  if (!process.env.SHOPIFY_WEBHOOK_SECRET) {
    console.warn('SHOPIFY_WEBHOOK_SECRET não configurado - webhook não verificado');
    return true; // Aceitar sem verificação se não configurado
  }

  const calculated = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(data, 'utf8')
    .digest('base64');

  return calculated === hmacSignature;
}

export const handler = async (event) => {
  // Só aceitar POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Allow': 'POST',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Método não permitido. Use POST.' })
    };
  }

  try {
    console.log('🛒 Webhook Shopify recebido');
    
    // Verificar autenticidade do webhook (opcional)
    const hmacSignature = event.headers['x-shopify-hmac-sha256'];
    if (!verifyShopifyWebhook(event.body, hmacSignature)) {
      console.error('❌ Assinatura do webhook inválida');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Webhook não autorizado' })
      };
    }

    // Parse do payload do Shopify
    const order = JSON.parse(event.body);
    console.log(`📦 Processando ordem ${order.order_number || order.id}`);

    // Processar cada item da ordem
    const vendasParaInserir = [];
    
    for (const item of order.line_items) {
      const vendaData = {
        order_id: order.id,
        produto: item.title,
        preco: parseFloat(item.price),
        quantidade: item.quantity,
        customer_email: order.customer?.email || null,
        customer_name: order.customer ? 
          `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : null,
        order_number: order.order_number || order.name,
        financial_status: order.financial_status || 'pending',
        fulfillment_status: order.fulfillment_status || 'unfulfilled',
        currency: order.currency || 'EUR',
        shop_domain: order.shop_domain || event.headers['x-shopify-shop-domain']
      };

      vendasParaInserir.push(vendaData);
    }

    // Inserir no Supabase
    const { data, error } = await supabase
      .from('vendas')
      .insert(vendasParaInserir)
      .select();

    if (error) {
      console.error('❌ Erro ao inserir no Supabase:', error);
      
      // Se for erro de duplicata (ordem já existe), retornar sucesso
      if (error.code === '23505' || error.message.includes('duplicate')) {
        console.log('⚠️ Ordem já existe na base de dados - ignorando');
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            message: 'Ordem já processada anteriormente',
            order_id: order.id
          })
        };
      }
      
      throw error;
    }

    console.log(`✅ ${vendasParaInserir.length} venda(s) salva(s) com sucesso:`, data);

    // Resposta de sucesso
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Vendas salvas com sucesso',
        order_id: order.id,
        order_number: order.order_number || order.name,
        items_count: vendasParaInserir.length,
        vendas: data
      })
    };

  } catch (error) {
    console.error('💥 Erro no webhook:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Erro interno do servidor',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Função adicional para testar o webhook localmente
export const testHandler = async () => {
  // Exemplo de payload do Shopify para teste
  const mockOrder = {
    id: 123456789,
    order_number: 1001,
    name: "#1001",
    financial_status: "paid",
    fulfillment_status: "fulfilled",
    currency: "EUR",
    shop_domain: "minha-loja.myshopify.com",
    customer: {
      email: "cliente@example.com",
      first_name: "João",
      last_name: "Silva"
    },
    line_items: [
      {
        title: "Produto Teste",
        price: "29.99",
        quantity: 2
      }
    ]
  };

  return await handler({
    httpMethod: 'POST',
    headers: {},
    body: JSON.stringify(mockOrder)
  });
};
