import { supabase } from '../config/supabase';
import productService from './productService';

/**
 * Serviço para integração com Shopify
 */
class ShopifyService {
  
  /**
   * Salvar configuração da Shopify para o usuário
   */
  async saveShopifyConfig(config) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const configData = {
        user_id: user.id,
        shop_name: config.shopName,
        access_token: config.accessToken, // Em produção, criptografar este token
        webhook_url: config.webhookUrl,
        is_connected: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Verificar se já existe configuração
      const { data: existingConfig } = await supabase
        .from('shopify_configs')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existingConfig) {
        // Atualizar configuração existente
        result = await supabase
          .from('shopify_configs')
          .update(configData)
          .eq('user_id', user.id)
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
   * Buscar configuração da Shopify do usuário
   */
  async getShopifyConfig() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('shopify_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return {
        success: true,
        data: data || null,
        message: data ? 'Configuração encontrada' : 'Nenhuma configuração encontrada'
      };
    } catch (error) {
      console.error('Erro ao buscar configuração Shopify:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Erro ao buscar configuração da Shopify'
      };
    }
  }

  /**
   * Testar conexão com a Shopify 
   */
  async testConnection(shopName, accessToken, webhookUrl = null) {
    try {
      // Em desenvolvimento, simular sucesso e salvar configuração diretamente
      if (process.env.NODE_ENV === 'development') {
        return await this.testConnectionDevelopment(shopName, accessToken, webhookUrl);
      }

      // Em produção, usar função Netlify
      return await this.testConnectionProduction(shopName, accessToken, webhookUrl);
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
   * Teste de conexão para desenvolvimento (simula sucesso)
   */
  async testConnectionDevelopment(shopName, accessToken, webhookUrl) {
    try {
      // Validar inputs básicos
      if (!shopName || !accessToken) {
        throw new Error('Nome da loja e access token são obrigatórios');
      }

      if (!accessToken.startsWith('shpat_')) {
        throw new Error('Access token deve começar com "shpat_"');
      }

      // Salvar configuração diretamente
      const saveResult = await this.saveShopifyConfig({
        shopName,
        accessToken,
        webhookUrl: webhookUrl || 'https://sheet-tools.com/.netlify/functions/shopify-webhook'
      });

      if (!saveResult.success) {
        throw new Error(saveResult.message);
      }

      return {
        success: true,
        message: `Conexão simulada com sucesso! Loja: ${shopName}`,
        data: {
          shop: { name: shopName, domain: `${shopName}.myshopify.com` },
          config: saveResult.data
        },
        webhook_status: 'manual_required'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Erro na validação'
      };
    }
  }

  /**
   * Teste de conexão para produção (via função Netlify)
   */
  async testConnectionProduction(shopName, accessToken, webhookUrl) {
    try {
      // Obter token de autenticação atual
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // Fazer chamada para função Netlify
      const response = await fetch('/.netlify/functions/test-shopify-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          shopName,
          accessToken,
          webhookUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erro na conexão: ${response.status}`);
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Erro ao conectar com a Shopify');
    }
  }

  /**
   * Criar webhook na Shopify
   */
  async createWebhook(shopName, accessToken, webhookUrl) {
    try {
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
        throw new Error(`Erro ao criar webhook: ${response.status} ${response.statusText}`);
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
   * Processar webhook de pedido da Shopify
   */
  async processOrderWebhook(orderData) {
    try {
      // Encontrar usuário baseado no nome da loja (você pode ajustar esta lógica)
      const shopDomain = orderData.shop_domain || orderData.domain;
      const shopName = shopDomain?.replace('.myshopify.com', '');

      const { data: shopifyConfig } = await supabase
        .from('shopify_configs')
        .select('user_id, shop_name')
        .eq('shop_name', shopName)
        .single();

      if (!shopifyConfig) {
        throw new Error('Configuração da loja não encontrada');
      }

      // Processar cada item do pedido
      const orderItems = orderData.line_items || [];
      const processedProducts = [];

      for (const item of orderItems) {
        // Verificar se o produto já existe
        let existingProduct = await this.findProductBySku(item.sku, shopifyConfig.user_id);
        
        if (!existingProduct) {
          // Criar novo produto baseado no item do pedido
          const productResult = await this.createProductFromOrderItem(item, shopifyConfig.user_id);
          if (productResult.success) {
            processedProducts.push(productResult.data);
          }
        } else {
          processedProducts.push(existingProduct);
        }
      }

      // Criar uma quotation baseada no pedido
      const quotationResult = await this.createQuotationFromOrder(orderData, processedProducts, shopifyConfig.user_id);

      return {
        success: true,
        data: {
          order: orderData,
          products: processedProducts,
          quotation: quotationResult.data
        },
        message: 'Pedido processado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao processar webhook do pedido:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Erro ao processar pedido'
      };
    }
  }

  /**
   * Encontrar produto por SKU
   */
  async findProductBySku(sku, userId) {
    try {
      if (!sku) return null;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .eq('sku', sku)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar produto por SKU:', error);
      return null;
    }
  }

  /**
   * Criar produto baseado no item do pedido
   */
  async createProductFromOrderItem(item, userId) {
    try {
      const productData = {
        user_id: userId,
        name: item.title || item.name,
        price: parseFloat(item.price || 0),
        sku: item.sku || null,
        shopify_product_id: item.product_id?.toString(),
        shopify_variant_id: item.variant_id?.toString(),
        in_stock: true, // Assumir que está em estoque se foi vendido
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data,
        message: 'Produto criado a partir do pedido'
      };
    } catch (error) {
      console.error('Erro ao criar produto do pedido:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Erro ao criar produto'
      };
    }
  }

  /**
   * Criar quotation baseada no pedido
   */
  async createQuotationFromOrder(orderData, products, userId) {
    try {
      const quotationData = {
        user_id: userId,
        shopify_order_id: orderData.id?.toString(),
        customer_email: orderData.email,
        customer_name: `${orderData.billing_address?.first_name || ''} ${orderData.billing_address?.last_name || ''}`.trim(),
        total_amount: parseFloat(orderData.total_price || 0),
        currency: orderData.currency || 'EUR',
        order_date: orderData.created_at,
        status: 'received', // Status personalizado
        products: products.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1 // Você pode ajustar baseado nos line_items
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('quotations')
        .insert([quotationData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data,
        message: 'Quotation criada a partir do pedido'
      };
    } catch (error) {
      console.error('Erro ao criar quotation:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Erro ao criar quotation'
      };
    }
  }

  /**
   * Verificar assinatura HMAC do webhook (segurança)
   */
  verifyWebhookSignature(data, signature, secret) {
    try {
      const crypto = require('crypto');
      const calculated = crypto
        .createHmac('sha256', secret)
        .update(data, 'utf8')
        .digest('base64');
      
      return calculated === signature;
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      return false;
    }
  }
}

export default new ShopifyService();
