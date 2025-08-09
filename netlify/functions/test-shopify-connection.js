// Função Netlify para testar conexão com Shopify
// Resolve problemas de CORS ao testar conexão do frontend

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Testar conexão com a API da Shopify
 */
async function testShopifyConnection(shopName, accessToken) {
  try {
    const fetch = require('node-fetch');
    
    const response = await fetch(`https://${shopName}.myshopify.com/admin/api/2025-01/shop.json`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na conexão: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.shop,
      message: 'Conexão com Shopify estabelecida com sucesso'
    };
  } catch (error) {
    console.error('Erro ao testar conexão Shopify:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Erro ao conectar com a Shopify'
    };
  }
}

/**
 * Salvar configuração da Shopify
 */
async function saveShopifyConfig(config, userId) {
  try {
    const configData = {
      user_id: userId,
      shop_name: config.shopName,
      access_token: config.accessToken,
      webhook_url: config.webhookUrl,
      is_connected: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Verificar se já existe configuração
    const { data: existingConfig } = await supabase
      .from('shopify_configs')
      .select('id')
      .eq('user_id', userId)
      .single();

    let result;
    if (existingConfig) {
      // Atualizar configuração existente
      result = await supabase
        .from('shopify_configs')
        .update(configData)
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      // Criar nova configuração
      result = await supabase
        .from('shopify_configs')
        .insert([configData])
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    return {
      success: true,
      data: result.data,
      message: 'Configuração da Shopify salva com sucesso'
    };
  } catch (error) {
    console.error('Erro ao salvar configuração Shopify:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Erro ao salvar configuração da Shopify'
    };
  }
}

/**
 * Criar webhook na Shopify
 */
async function createWebhook(shopName, accessToken, webhookUrl) {
  try {
    const fetch = require('node-fetch');
    
    const webhookData = {
      webhook: {
        topic: 'orders/create',
        address: webhookUrl,
        format: 'json'
      }
    };

    const response = await fetch(`https://${shopName}.myshopify.com/admin/api/2025-01/webhooks.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Aviso: Não foi possível criar webhook:', errorText);
      return {
        success: false,
        data: null,
        message: `Webhook não criado: ${response.status} ${response.statusText}`
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.webhook,
      message: 'Webhook criado com sucesso'
    };
  } catch (error) {
    console.error('Erro ao criar webhook:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Erro ao criar webhook'
    };
  }
}

/**
 * Handler principal da função
 */
exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Responder a OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Permitir apenas POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    // Verificar autenticação
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Token de autorização necessário' })
      };
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verificar token com Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Token inválido' })
      };
    }

    // Parse do body
    const { shopName, accessToken, webhookUrl } = JSON.parse(event.body);

    if (!shopName || !accessToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'shopName e accessToken são obrigatórios' })
      };
    }

    console.log(`Testando conexão Shopify para usuário ${user.id}, loja: ${shopName}`);

    // 1. Testar conexão com Shopify
    const connectionResult = await testShopifyConnection(shopName, accessToken);
    if (!connectionResult.success) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify(connectionResult)
      };
    }

    // 2. Salvar configuração no banco
    const saveResult = await saveShopifyConfig({
      shopName,
      accessToken,
      webhookUrl: webhookUrl || `${process.env.URL}/.netlify/functions/shopify-webhook`
    }, user.id);

    if (!saveResult.success) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify(saveResult)
      };
    }

    // 3. Criar webhook automaticamente
    let webhookResult = { success: false, message: 'Webhook não configurado' };
    try {
      console.log('Criando webhook automaticamente...');
      webhookResult = await createWebhook(
        shopName,
        accessToken,
        webhookUrl || `${process.env.URL}/.netlify/functions/shopify-webhook`
      );
      
      if (webhookResult.success) {
        console.log('✅ Webhook criado automaticamente');
        
        // Atualizar configuração para marcar webhook como criado
        await supabase
          .from('shopify_configs')
          .update({ 
            webhook_created: true,
            webhook_id: webhookResult.data.id?.toString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      }
    } catch (webhookError) {
      console.warn('Aviso: Não foi possível criar webhook automaticamente:', webhookError);
      webhookResult = { 
        success: false, 
        message: `Erro ao criar webhook: ${webhookError.message}` 
      };
    }

    // Resposta de sucesso
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Conexão estabelecida com sucesso! Loja: ${connectionResult.data.name}`,
        data: {
          shop: connectionResult.data,
          config: saveResult.data,
          webhook: webhookResult.data
        },
        webhook_status: webhookResult.success ? 'criado' : 'manual_required',
        webhook_message: webhookResult.message
      })
    };

  } catch (error) {
    console.error('Erro na função test-shopify-connection:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message || 'Erro interno do servidor'
      })
    };
  }
};
