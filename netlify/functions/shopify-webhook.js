// Netlify Function para processar webhooks da Shopify
// Este arquivo deve ser colocado em netlify/functions/

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Chave de serviço para bypassing RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Verificar assinatura HMAC do webhook Shopify
 */
function verifyShopifyWebhook(data, signature, secret) {
  const crypto = require('crypto');
  const calculated = crypto
    .createHmac('sha256', secret)
    .update(data, 'utf8')
    .digest('base64');
  
  return calculated === signature;
}

/**
 * Processar webhook de pedido da Shopify
 */
async function processOrderWebhook(orderData) {
  try {
    console.log('Processando pedido Shopify:', orderData.id);

    // Encontrar configuração da loja baseada no domínio
    const shopDomain = orderData.shop_domain || orderData.domain;
    const shopName = shopDomain?.replace('.myshopify.com', '');

    const { data: shopifyConfig, error: configError } = await supabase
      .from('shopify_configs')
      .select('user_id, shop_name')
      .eq('shop_name', shopName)
      .single();

    if (configError || !shopifyConfig) {
      console.error('Configuração da loja não encontrada:', shopName);
      return { success: false, message: 'Loja não configurada' };
    }

    // Processar produtos do pedido
    const orderItems = orderData.line_items || [];
    const processedProducts = [];

    for (const item of orderItems) {
      // Verificar se produto já existe
      const { data: existingProduct } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', shopifyConfig.user_id)
        .eq('sku', item.sku || item.variant_id?.toString())
        .single();

      if (!existingProduct && item.title) {
        // Criar novo produto
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert([{
            user_id: shopifyConfig.user_id,
            name: item.title,
            price: parseFloat(item.price || 0),
            sku: item.sku || item.variant_id?.toString(),
            shopify_product_id: item.product_id?.toString(),
            shopify_variant_id: item.variant_id?.toString(),
            in_stock: true
          }])
          .select()
          .single();

        if (!productError && newProduct) {
          processedProducts.push({
            ...newProduct,
            quantity: item.quantity || 1
          });
        }
      } else if (existingProduct) {
        processedProducts.push({
          ...existingProduct,
          quantity: item.quantity || 1
        });
      }
    }

    // Criar quotation do pedido
    const quotationData = {
      user_id: shopifyConfig.user_id,
      shopify_order_id: orderData.id?.toString(),
      customer_email: orderData.email,
      customer_name: `${orderData.billing_address?.first_name || ''} ${orderData.billing_address?.last_name || ''}`.trim() || orderData.customer?.first_name + ' ' + orderData.customer?.last_name || 'Cliente',
      total_amount: parseFloat(orderData.total_price || 0),
      currency: orderData.currency || 'EUR',
      order_date: orderData.created_at,
      status: 'received',
      products: processedProducts
    };

    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .insert([quotationData])
      .select()
      .single();

    if (quotationError) {
      console.error('Erro ao criar quotation:', quotationError);
      return { success: false, message: 'Erro ao criar quotation' };
    }

    // Log do webhook
    await supabase
      .from('webhook_logs')
      .insert([{
        user_id: shopifyConfig.user_id,
        webhook_type: 'orders/create',
        shopify_order_id: orderData.id?.toString(),
        payload: orderData,
        status: 'processed',
        processed_at: new Date().toISOString()
      }]);

    console.log('Pedido processado com sucesso:', quotation.id);

    return {
      success: true,
      message: 'Pedido processado com sucesso',
      data: {
        quotation_id: quotation.id,
        products_count: processedProducts.length
      }
    };

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    
    // Log do erro
    if (orderData.shop_domain) {
      await supabase
        .from('webhook_logs')
        .insert([{
          webhook_type: 'orders/create',
          shopify_order_id: orderData.id?.toString(),
          payload: orderData,
          status: 'error',
          error_message: error.message
        }]);
    }

    return { success: false, message: error.message };
  }
}

/**
 * Handler principal da função Netlify
 */
exports.handler = async (event, context) => {
  // Permitir apenas POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    const body = event.body;
    const headers = event.headers;
    
    // Verificar headers necessários
    const shopifyHmac = headers['x-shopify-hmac-sha256'];
    const shopifyTopic = headers['x-shopify-topic'];
    const shopifyShopDomain = headers['x-shopify-shop-domain'];

    if (!shopifyTopic || !shopifyShopDomain) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Headers Shopify necessários não encontrados' })
      };
    }

    // Parse do JSON
    let orderData;
    try {
      orderData = JSON.parse(body);
    } catch (parseError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'JSON inválido' })
      };
    }

    // Verificar assinatura HMAC (em produção, usar webhook secret)
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
    if (webhookSecret && shopifyHmac) {
      const isValid = verifyShopifyWebhook(body, shopifyHmac, webhookSecret);
      if (!isValid) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'Assinatura inválida' })
        };
      }
    }

    // Processar baseado no tipo de webhook
    let result;
    switch (shopifyTopic) {
      case 'orders/create':
        result = await processOrderWebhook(orderData);
        break;
      
      case 'orders/updated':
        // Implementar processamento de pedidos atualizados
        result = { success: true, message: 'Webhook recebido mas não processado' };
        break;
      
      case 'orders/cancelled':
        // Implementar processamento de pedidos cancelados
        result = { success: true, message: 'Webhook recebido mas não processado' };
        break;
      
      default:
        result = { success: true, message: `Webhook ${shopifyTopic} recebido mas não processado` };
    }

    return {
      statusCode: result.success ? 200 : 400,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Erro no webhook handler:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: 'Erro interno do servidor',
        error: error.message 
      })
    };
  }
};
