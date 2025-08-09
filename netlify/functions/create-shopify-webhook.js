// Função Netlify para criar webhook automaticamente na Shopify

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Criar webhook na Shopify
 */
async function createShopifyWebhook(shopName, accessToken, webhookUrl) {
  try {
    const fetch = require('node-fetch');
    
    const webhookData = {
      webhook: {
        topic: 'orders/create',
        address: webhookUrl,
        format: 'json'
      }
    };

    console.log(`Criando webhook para loja: ${shopName}`);
    console.log(`URL do webhook: ${webhookUrl}`);

    const response = await fetch(`https://${shopName}.myshopify.com/admin/api/2025-01/webhooks.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });

    const responseText = await response.text();
    console.log(`Resposta da Shopify (${response.status}):`, responseText);

    if (!response.ok) {
      // Tentar fazer parse da resposta para obter detalhes do erro
      let errorDetails = responseText;
      try {
        const errorData = JSON.parse(responseText);
        errorDetails = errorData.errors ? JSON.stringify(errorData.errors) : responseText;
      } catch (e) {
        // Se não conseguir fazer parse, usar texto original
      }
      
      throw new Error(`Erro ${response.status}: ${errorDetails}`);
    }

    const data = JSON.parse(responseText);
    
    console.log('Webhook criado com sucesso:', data.webhook);

    return {
      success: true,
      data: data.webhook,
      message: 'Webhook criado automaticamente com sucesso'
    };
  } catch (error) {
    console.error('Erro ao criar webhook:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Erro ao criar webhook na Shopify'
    };
  }
}

/**
 * Verificar se webhook já existe
 */
async function checkExistingWebhooks(shopName, accessToken, webhookUrl) {
  try {
    const fetch = require('node-fetch');
    
    console.log(`Verificando webhooks existentes para: ${shopName}`);

    const response = await fetch(`https://${shopName}.myshopify.com/admin/api/2025-01/webhooks.json`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao verificar webhooks: ${response.status}`);
    }

    const data = await response.json();
    const webhooks = data.webhooks || [];
    
    // Verificar se já existe um webhook para a nossa URL
    const existingWebhook = webhooks.find(webhook => 
      webhook.topic === 'orders/create' && webhook.address === webhookUrl
    );

    console.log(`Webhooks existentes: ${webhooks.length}`);
    console.log(`Webhook já existe: ${!!existingWebhook}`);

    return {
      exists: !!existingWebhook,
      webhook: existingWebhook,
      allWebhooks: webhooks
    };
  } catch (error) {
    console.error('Erro ao verificar webhooks:', error);
    return {
      exists: false,
      error: error.message
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
    console.log('Iniciando criação de webhook...');

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
    const { shopName, accessToken } = JSON.parse(event.body);

    if (!shopName || !accessToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'shopName e accessToken são obrigatórios' })
      };
    }

    // Determinar URL do webhook baseado no ambiente
    const webhookUrl = `${process.env.URL}/.netlify/functions/shopify-webhook`;
    
    console.log(`Configurando webhook para usuário ${user.id}`);
    console.log(`Loja: ${shopName}`);
    console.log(`Webhook URL: ${webhookUrl}`);

    // Verificar se webhook já existe
    const existingCheck = await checkExistingWebhooks(shopName, accessToken, webhookUrl);
    
    if (existingCheck.exists) {
      console.log('Webhook já existe, não é necessário criar novo');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Webhook já configurado',
          data: existingCheck.webhook,
          action: 'already_exists'
        })
      };
    }

    // Criar novo webhook
    const result = await createShopifyWebhook(shopName, accessToken, webhookUrl);

    if (!result.success) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify(result)
      };
    }

    // Atualizar configuração no banco para marcar webhook como criado
    try {
      await supabase
        .from('shopify_configs')
        .update({ 
          webhook_created: true,
          webhook_id: result.data.id?.toString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    } catch (updateError) {
      console.warn('Erro ao atualizar configuração no banco:', updateError);
      // Não falhar por causa disso
    }

    console.log('Webhook criado com sucesso!');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Webhook criado automaticamente com sucesso',
        data: result.data,
        action: 'created'
      })
    };

  } catch (error) {
    console.error('Erro na função create-shopify-webhook:', error);
    
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
