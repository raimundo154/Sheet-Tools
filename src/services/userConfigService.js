import { supabase } from '../config/supabase';
import { authService } from './authService';

/**
 * Serviço para gerir configurações do usuário
 */
class UserConfigService {
  
  /**
   * Salvar domínio Shopify do usuário
   * @param {string} shopifyDomain - Domínio da loja Shopify (ex: minha-loja.myshopify.com)
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async saveShopifyDomain(shopifyDomain) {
    try {
      console.log('🔍 Iniciando saveShopifyDomain:', shopifyDomain);
      
      // Verificar se o usuário está autenticado
      const user = authService.getCurrentUser();
      console.log('👤 Usuário atual:', user);
      
      if (!user) {
        console.error('❌ Usuário não autenticado');
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      // Validar formato do domínio
      if (!shopifyDomain || !shopifyDomain.includes('.myshopify.com')) {
        console.error('❌ Formato de domínio inválido:', shopifyDomain);
        return {
          success: false,
          error: 'Formato de domínio inválido. Use o formato: exemplo.myshopify.com'
        };
      }

      // Limpar o domínio removendo protocolo se existir
      const cleanDomain = shopifyDomain
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '')
        .toLowerCase();

      console.log('🧹 Domínio limpo:', cleanDomain);
      console.log('👤 User ID:', user.id);

      // Salvar ou atualizar na tabela user_profiles
      console.log('💾 Executando upsert...');
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          shopify_domain: cleanDomain,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select();

      console.log('📊 Resultado do upsert:', { data, error });

      if (error) {
        console.error('❌ Erro ao salvar domínio Shopify:', error);
        return {
          success: false,
          error: `Erro ao salvar: ${error.message} (${error.code})`
        };
      }

      console.log(`✅ Domínio Shopify salvo com sucesso: ${cleanDomain}`, data);
      return {
        success: true,
        data: data[0]
      };

    } catch (error) {
      console.error('❌ Erro no saveShopifyDomain:', error);
      return {
        success: false,
        error: `Erro interno: ${error.message}`
      };
    }
  }

  /**
   * Obter domínio Shopify do usuário
   * @returns {Promise<{success: boolean, data?: string, error?: string}>}
   */
  async getShopifyDomain() {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('shopify_domain')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
        console.error('Erro ao obter domínio Shopify:', error);
        return {
          success: false,
          error: `Erro ao obter configurações: ${error.message}`
        };
      }

      return {
        success: true,
        data: data?.shopify_domain || null
      };

    } catch (error) {
      console.error('Erro no getShopifyDomain:', error);
      return {
        success: false,
        error: `Erro interno: ${error.message}`
      };
    }
  }

  /**
   * Obter todas as configurações do usuário
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async getUserConfig() {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao obter configurações do usuário:', error);
        return {
          success: false,
          error: `Erro ao obter configurações: ${error.message}`
        };
      }

      return {
        success: true,
        data: data || {}
      };

    } catch (error) {
      console.error('Erro no getUserConfig:', error);
      return {
        success: false,
        error: `Erro interno: ${error.message}`
      };
    }
  }
}

// Exportar instância única (singleton)
export const userConfigService = new UserConfigService();
export default userConfigService;