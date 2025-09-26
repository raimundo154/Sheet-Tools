// Service para gestão de dados Daily ROAS na Supabase
import { supabase } from '../config/supabase';

class DailyRoasService {
  
  /**
   * Obter todos os produtos para um utilizador numa data específica
   * @param {string} date - Data no formato YYYY-MM-DD
   * @returns {Promise<Array>} Lista de produtos com cálculos
   */
  async getProductsByDate(date) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Utilizador não autenticado');
      }

      const { data, error } = await supabase
        .from('daily_roas_data')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('date', date)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao obter dados:', error);
        throw error;
      }

      // Converter campos para o formato esperado pelo frontend
      return data.map(this.formatProductFromDB);
    } catch (error) {
      console.error('Erro no getProductsByDate:', error);
      throw error;
    }
  }

  /**
   * Salvar um produto individual
   * @param {Object} product - Dados do produto
   * @returns {Promise<Object>} Produto salvo
   */
  async saveProduct(product) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Utilizador não autenticado');
      }

      // Primeiro, verificar se já existe um produto com o mesmo nome na mesma data
      const { data: existingProducts, error: checkError } = await supabase
        .from('daily_roas_data')
        .select('id')
        .eq('user_id', user.user.id)
        .eq('date', product.date)
        .eq('product_name', product.productName);

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 é "no rows returned", que é normal quando não há produtos existentes
        console.error('Erro ao verificar produto existente:', checkError);
        throw checkError;
      }

      let result;
      if (existingProducts && existingProducts.length > 0) {
        // Atualizar produto existente (pegar o primeiro se houver múltiplos)
        const existingProduct = existingProducts[0];
        const productData = this.formatProductToDB(product, user.user.id, true);
        
        const { data, error } = await supabase
          .from('daily_roas_data')
          .update(productData)
          .eq('id', existingProduct.id)
          .select()
          .single();

        if (error) {
          console.error('Erro ao atualizar produto:', error);
          throw error;
        }
        result = data;
      } else {
        // Inserir novo produto
        const productData = this.formatProductToDB(product, user.user.id, false);
        
        const { data, error } = await supabase
          .from('daily_roas_data')
          .insert(productData)
          .select()
          .single();

        if (error) {
          console.error('Erro ao inserir produto:', error);
          throw error;
        }
        result = data;
      }

      return this.formatProductFromDB(result);
    } catch (error) {
      console.error('Erro no saveProduct:', error);
      throw error;
    }
  }

  /**
   * Salvar múltiplos produtos (batch)
   * @param {Array} products - Lista de produtos
   * @param {string} date - Data dos produtos
   * @returns {Promise<number>} Número de produtos salvos
   */
  async saveProductsBatch(products, date) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Utilizador não autenticado');
      }

      // Preparar dados para função SQL
      const productsData = products.map(product => ({
        product_name: product.productName,
        price: Number(product.price) || 0,
        cog: Number(product.cog) || 0,
        units_sold: Number(product.unitsSold) || 0,
        total_spend: Number(product.totalSpend) || 0,
        cpc: Number(product.cpc) || 0,
        atc: Number(product.atc) || 0,
        purchases: Number(product.purchases) || 0,
        total_cog: Number(product.totalCog) || 0,
        store_value: Number(product.storeValue) || 0,
        margin_bruta: Number(product.marginBruta) || 0,
        ber: product.ber || null,
        roas: product.roas || null,
        cpa: product.cpa || null,
        margin_eur: Number(product.marginEur) || 0,
        margin_pct: product.marginPct || null,
        source: product.source || 'manual'
      }));

      const { data, error } = await supabase.rpc('upsert_daily_roas_batch', {
        user_uuid: user.user.id,
        target_date: date,
        products_data: productsData
      });

      if (error) {
        console.error('Erro no batch save:', error);
        throw error;
      }

      return data; // Retorna número de produtos processados
    } catch (error) {
      console.error('Erro no saveProductsBatch:', error);
      throw error;
    }
  }

  /**
   * Eliminar um produto
   * @param {string} productId - ID do produto
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async deleteProduct(productId) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Utilizador não autenticado');
      }

      const { error } = await supabase
        .from('daily_roas_data')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.user.id); // Segurança extra

      if (error) {
        console.error('Erro ao eliminar produto:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro no deleteProduct:', error);
      throw error;
    }
  }

  /**
   * Obter resumo diário
   * @param {string} date - Data no formato YYYY-MM-DD
   * @returns {Promise<Object>} Resumo com métricas agregadas
   */
  async getDailySummary(date) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Utilizador não autenticado');
      }

      const { data, error } = await supabase.rpc('get_daily_summary', {
        user_uuid: user.user.id,
        target_date: date
      });

      if (error) {
        console.error('Erro ao obter resumo:', error);
        throw error;
      }

      const summary = data[0] || {
        total_spend: 0,
        total_revenue: 0,
        total_margin_eur: 0,
        weighted_roas: 0,
        product_count: 0
      };

      return {
        totalSpend: Number(summary.total_spend).toFixed(2),
        totalRevenue: Number(summary.total_revenue).toFixed(2),
        totalMarginEur: Number(summary.total_margin_eur).toFixed(2),
        weightedRoas: Number(summary.weighted_roas).toFixed(4),
        productCount: summary.product_count
      };
    } catch (error) {
      console.error('Erro no getDailySummary:', error);
      // Retornar resumo vazio em caso de erro
      return {
        totalSpend: '0.00',
        totalRevenue: '0.00',
        totalMarginEur: '0.00',
        weightedRoas: '0.0000',
        productCount: 0
      };
    }
  }

  /**
   * Eliminar todos os produtos de uma data
   * @param {string} date - Data no formato YYYY-MM-DD
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async deleteAllProductsByDate(date) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Utilizador não autenticado');
      }

      const { error } = await supabase
        .from('daily_roas_data')
        .delete()
        .eq('user_id', user.user.id)
        .eq('date', date);

      if (error) {
        console.error('Erro ao eliminar produtos da data:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro no deleteAllProductsByDate:', error);
      throw error;
    }
  }

  /**
   * Converter produto da base de dados para formato frontend
   * @param {Object} dbProduct - Produto da BD
   * @returns {Object} Produto formatado para frontend
   */
  formatProductFromDB(dbProduct) {
    return {
      id: dbProduct.id,
      date: dbProduct.date,
      productId: dbProduct.id, // Usar ID da BD como productId
      productName: dbProduct.product_name,
      price: Number(dbProduct.price),
      cog: Number(dbProduct.cog),
      unitsSold: Number(dbProduct.units_sold),
      totalSpend: Number(dbProduct.total_spend),
      cpc: Number(dbProduct.cpc),
      atc: Number(dbProduct.atc),
      purchases: Number(dbProduct.purchases),
      totalCog: Number(dbProduct.total_cog),
      storeValue: Number(dbProduct.store_value),
      marginBruta: Number(dbProduct.margin_bruta),
      ber: dbProduct.ber,
      roas: dbProduct.roas,
      cpa: dbProduct.cpa,
      marginEur: Number(dbProduct.margin_eur),
      marginPct: dbProduct.margin_pct,
      source: dbProduct.source || 'manual',
      createdAt: dbProduct.created_at,
      updatedAt: dbProduct.updated_at
    };
  }

  /**
   * Converter produto do frontend para formato da base de dados
   * @param {Object} product - Produto do frontend
   * @param {string} userId - ID do utilizador
   * @param {boolean} includeId - Se deve incluir o ID (para updates)
   * @returns {Object} Produto formatado para BD
   */
  formatProductToDB(product, userId, includeId = false) {
    const productData = {
      user_id: userId,
      date: product.date,
      product_name: product.productName,
      price: Number(product.price) || 0,
      cog: Number(product.cog) || 0,
      units_sold: Number(product.unitsSold) || 0,
      total_spend: Number(product.totalSpend) || 0,
      cpc: Number(product.cpc) || 0,
      atc: Number(product.atc) || 0,
      purchases: Number(product.purchases) || 0,
      total_cog: Number(product.totalCog) || 0,
      store_value: Number(product.storeValue) || 0,
      margin_bruta: Number(product.marginBruta) || 0,
      ber: product.ber || null,
      roas: product.roas || null,
      cpa: product.cpa || null,
      margin_eur: Number(product.marginEur) || 0,
      margin_pct: product.marginPct || null,
      source: product.source || 'manual'
    };

    // Só incluir ID se for um update e o ID for válido (não timestamp)
    if (includeId && product.id && typeof product.id === 'string' && product.id.length > 10) {
      productData.id = product.id;
    }

    return productData;
  }

  /**
   * Limpar duplicados na base de dados (manter apenas o mais recente)
   * @param {string} date - Data específica (opcional)
   * @returns {Promise<number>} Número de duplicados removidos
   */
  async cleanupDuplicates(date = null) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Utilizador não autenticado');
      }

      // Construir query base
      let query = supabase
        .from('daily_roas_data')
        .select('id, date, product_name, created_at')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (date) {
        query = query.eq('date', date);
      }

      const { data: allProducts, error } = await query;

      if (error) {
        console.error('Erro ao obter produtos para limpeza:', error);
        throw error;
      }

      // Agrupar por date + product_name e manter apenas o mais recente
      const seen = new Set();
      const toDelete = [];

      for (const product of allProducts) {
        const key = `${product.date}_${product.product_name}`;
        if (seen.has(key)) {
          toDelete.push(product.id);
        } else {
          seen.add(key);
        }
      }

      // Eliminar duplicados
      if (toDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('daily_roas_data')
          .delete()
          .in('id', toDelete);

        if (deleteError) {
          console.error('Erro ao eliminar duplicados:', deleteError);
          throw deleteError;
        }
      }

      return toDelete.length;
    } catch (error) {
      console.error('Erro no cleanupDuplicates:', error);
      throw error;
    }
  }

  /**
   * Verificar se o utilizador está autenticado
   * @returns {Promise<boolean>} True se autenticado
   */
  async isAuthenticated() {
    try {
      const { data: user } = await supabase.auth.getUser();
      return !!user?.user?.id;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }

  /**
   * Obter estatísticas gerais do utilizador
   * @returns {Promise<Object>} Estatísticas gerais
   */
  async getUserStats() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Utilizador não autenticado');
      }

      const { data, error } = await supabase
        .from('daily_roas_data')
        .select('date, total_spend, store_value, margin_eur')
        .eq('user_id', user.user.id);

      if (error) {
        console.error('Erro ao obter estatísticas:', error);
        throw error;
      }

      const uniqueDates = [...new Set(data.map(item => item.date))].length;
      const totalProducts = data.length;
      const totalSpend = data.reduce((sum, item) => sum + Number(item.total_spend), 0);
      const totalRevenue = data.reduce((sum, item) => sum + Number(item.store_value), 0);
      const totalMargin = data.reduce((sum, item) => sum + Number(item.margin_eur), 0);

      return {
        uniqueDates,
        totalProducts,
        totalSpend: totalSpend.toFixed(2),
        totalRevenue: totalRevenue.toFixed(2),
        totalMargin: totalMargin.toFixed(2),
        overallRoas: totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(4) : '0.0000'
      };
    } catch (error) {
      console.error('Erro no getUserStats:', error);
      return {
        uniqueDates: 0,
        totalProducts: 0,
        totalSpend: '0.00',
        totalRevenue: '0.00',
        totalMargin: '0.00',
        overallRoas: '0.0000'
      };
    }
  }
}

// Instância singleton
const dailyRoasService = new DailyRoasService();
export default dailyRoasService;
