import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Inicializar cliente Supabase com service role para inserções
const supabaseUrl = process.env.SUPABASE_URL || 'https://dnamxsapwgltxmtokecd.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada no Netlify!');
  console.log('ℹ️ Configure em: Netlify Dashboard > Site settings > Environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
  // Verificar se variáveis de ambiente estão configuradas
  if (!supabaseKey) {
    console.error('🚨 Webhook falhou: SUPABASE_SERVICE_ROLE_KEY não configurada');
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Configuração inválida',
        message: 'SUPABASE_SERVICE_ROLE_KEY não configurada no Netlify',
        debug_info: {
          supabase_url: supabaseUrl,
          has_service_key: !!supabaseKey,
          environment: process.env.NODE_ENV || 'unknown'
        }
      })
    };
  }

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
      // Capturar URL da imagem do produto (primeira imagem se houver múltiplas)
      let productImageUrl = null;
      if (item.properties) {
        // Se a imagem estiver nas propriedades do item
        const imageProperty = item.properties.find(prop => 
          prop.name === 'image' || prop.name === 'product_image'
        );
        if (imageProperty) {
          productImageUrl = imageProperty.value;
        }
      }
      
      // Se não encontrou nas propriedades, tentar pegar do variant ou produto
      if (!productImageUrl && item.variant_image) {
        productImageUrl = item.variant_image.src;
      }
      
      // Fallback para imagem genérica se não houver imagem
      if (!productImageUrl) {
        productImageUrl = `https://via.placeholder.com/150x150/e2e8f0/64748b?text=${encodeURIComponent(item.title.substring(0, 10))}`;
      }

      // Buscar user_id - sempre usar o primeiro usuário disponível
      const shopDomain = order.shop_domain || event.headers['x-shopify-shop-domain'];
      let userId = null;
      
      console.log(`🏪 Processando venda da loja: ${shopDomain}`);
      
      try {
        // Buscar o primeiro usuário disponível na base de dados
        const { data: firstUser, error } = await supabase
          .rpc('get_first_user');
        
        if (firstUser && !error) {
          userId = firstUser;
          console.log(`✅ User ID encontrado: ${userId}`);
        } else {
          console.error(`❌ Erro ao buscar user_id:`, error);
        }
      } catch (error) {
        console.error(`💥 Erro inesperado ao buscar user_id:`, error);
      }
      
      if (!userId) {
        console.error(`🚨 ATENÇÃO: Venda será criada sem user_id!`);
      }

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
        shop_domain: shopDomain,
        product_image_url: productImageUrl,
        user_id: userId
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
        quantity: 2,
        variant_image: {
          src: "https://via.placeholder.com/300x300/3b82f6/ffffff?text=Produto+Teste"
        }
      }
    ]
  };

  return await handler({
    httpMethod: 'POST',
    headers: {},
    body: JSON.stringify(mockOrder)
  });
};


