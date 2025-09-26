// Serviço para integração de dados do Daily ROAS
// Combina dados de Campaigns e Quotation sheet para calcular ROAS consolidado

import { supabase } from '../config/supabase';
import userService from './userService';
import productService from './productService';
import salesService from './salesService';

class DailyRoasIntegrationService {
  
  /**
   * Obter dados consolidados do Daily ROAS
   * Combina dados de Campaigns e Quotation sheet
   * @param {string} date - Data no formato YYYY-MM-DD
   * @returns {Promise<Object>} Dados consolidados
   */
  async getConsolidatedDailyRoas(date) {
    try {
      console.log('🔍 Buscando dados consolidados para:', date);
      
      // Buscar dados de ambas as fontes em paralelo
      const [campaignsData, quotationData] = await Promise.all([
        this.getCampaignsData(date),
        this.getQuotationData(date)
      ]);

      console.log('📊 Dados de Campaigns:', campaignsData);
      console.log('📊 Dados de Quotation:', quotationData);

      // Consolidar dados por produto
      const consolidatedData = this.consolidateDataByProduct(campaignsData, quotationData, date);
      
      console.log('✅ Dados consolidados:', consolidatedData);
      
      return {
        success: true,
        data: consolidatedData,
        summary: this.calculateSummary(consolidatedData)
      };

    } catch (error) {
      console.error('❌ Erro ao obter dados consolidados:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        summary: this.getEmptySummary()
      };
    }
  }

  /**
   * Obter produtos da Quotation sheet automaticamente
   * @param {string} date - Data no formato YYYY-MM-DD
   * @returns {Promise<Array>} Produtos da quotation formatados para Daily ROAS
   */
  async getQuotationProductsForDailyRoas(date) {
    try {
      console.log('🔄 Buscando produtos da Quotation sheet para Daily ROAS:', date);
      
      // Buscar produtos da tabela products
      const productsResult = await productService.getProducts();
      const products = productsResult.success ? productsResult.data : [];

      // Buscar dados de vendas para a data específica
      const salesResult = await salesService.getSalesByDate(date);
      const sales = salesResult.success ? salesResult.data : [];

      // Converter produtos para formato Daily ROAS
      const dailyRoasProducts = products.map(product => {
        // Encontrar vendas para este produto na data específica
        const productSales = sales.filter(sale => 
          sale.produto && sale.produto.toLowerCase() === product.name.toLowerCase()
        );

        // Calcular métricas de vendas
        const totalUnitsSold = productSales.reduce((sum, sale) => sum + (sale.quantidade || 0), 0);
        const totalSales = productSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const numberOfSales = productSales.length;

        // Criar produto no formato Daily ROAS
        return {
          id: `quotation-${product.id}-${date}`,
          productName: product.name,
          price: product.price,
          cog: 0, // COG será preenchido manualmente ou via campaigns
          unitsSold: totalUnitsSold,
          totalSpend: 0, // Será preenchido via campaigns
          cpc: 0, // Será preenchido via campaigns
          atc: 0, // Será preenchido via campaigns
          purchases: numberOfSales,
          totalCog: 0, // Calculado automaticamente
          storeValue: product.price * totalUnitsSold,
          marginBruta: product.price, // Assumindo COG = 0 inicialmente
          marginEur: product.price * totalUnitsSold,
          marginPct: 100, // Assumindo COG = 0 inicialmente
          roas: 0, // Será calculado quando houver spend
          cpa: 0, // Será calculado quando houver spend
          ber: 0, // Será calculado quando houver spend
          date: date,
          source: 'quotation-auto',
          // Dados adicionais da quotation
          shippingTime: product.shipping_time,
          inStock: product.in_stock,
          imageUrl: product.image_url,
          // Status de dados
          hasCampaignData: false,
          hasQuotationData: true,
          dataCompleteness: {
            percentage: 50,
            hasCampaignData: false,
            hasQuotationData: true,
            missingFields: ['Dados de Campanhas'],
            isComplete: false
          }
        };
      });

      console.log('✅ Produtos da Quotation convertidos para Daily ROAS:', dailyRoasProducts);
      return dailyRoasProducts;

    } catch (error) {
      console.error('❌ Erro ao obter produtos da Quotation:', error);
      return [];
    }
  }

  /**
   * Obter dados de Campaigns
   * @param {string} date - Data no formato YYYY-MM-DD
   * @returns {Promise<Array>} Dados de campanhas
   */
  async getCampaignsData(date) {
    try {
      if (!userService.isLoggedIn()) {
        return [];
      }

      const userCampaigns = userService.getUserData('campaigns') || [];
      
      // Filtrar campanhas que têm dados para a data específica
      const campaignsForDate = userCampaigns.filter(campaign => {
        if (!campaign.days || campaign.days.length === 0) return false;
        
        // Verificar se há dados para a data específica
        return campaign.days.some(day => day.date === date);
      });

      // Extrair dados relevantes das campanhas
      const campaignsData = campaignsForDate.map(campaign => {
        const dayData = campaign.days.find(day => day.date === date);
        
        return {
          campaignId: campaign.id,
          campaignName: campaign.name,
          productName: campaign.productName,
          productPrice: campaign.productPrice,
          cogs: campaign.cogs,
          totalSpend: dayData?.spend || 0,
          cpc: dayData?.cpc || 0,
          clicks: dayData?.clicks || 0,
          impressions: dayData?.impressions || 0,
          productLink: campaign.productLink || '',
          marketType: campaign.marketType,
          source: 'campaigns'
        };
      });

      return campaignsData;

    } catch (error) {
      console.error('❌ Erro ao obter dados de campaigns:', error);
      return [];
    }
  }

  /**
   * Obter dados de Quotation sheet
   * @param {string} date - Data no formato YYYY-MM-DD
   * @returns {Promise<Array>} Dados de quotation
   */
  async getQuotationData(date) {
    try {
      // Buscar produtos da tabela products
      const productsResult = await productService.getProducts();
      const products = productsResult.success ? productsResult.data : [];

      // Buscar dados de vendas para a data específica
      const salesResult = await salesService.getSalesByDate(date);
      const sales = salesResult.success ? salesResult.data : [];

      // Combinar dados de produtos com vendas
      const quotationData = products.map(product => {
        // Encontrar vendas para este produto na data específica
        const productSales = sales.filter(sale => 
          sale.produto && sale.produto.toLowerCase() === product.name.toLowerCase()
        );

        // Calcular métricas de vendas
        const totalUnitsSold = productSales.reduce((sum, sale) => sum + (sale.quantidade || 0), 0);
        const totalSales = productSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const numberOfSales = productSales.length;

        return {
          productId: product.id,
          productName: product.name,
          price: product.price,
          cogs: 0, // COG não está na tabela products, será preenchido manualmente
          unitsSold: totalUnitsSold,
          totalSales: totalSales,
          numberOfSales: numberOfSales,
          shippingTime: product.shipping_time,
          inStock: product.in_stock,
          imageUrl: product.image_url,
          source: 'quotation'
        };
      });

      return quotationData;

    } catch (error) {
      console.error('❌ Erro ao obter dados de quotation:', error);
      return [];
    }
  }

  /**
   * Consolidar dados por produto
   * @param {Array} campaignsData - Dados de campanhas
   * @param {Array} quotationData - Dados de quotation
   * @param {string} date - Data
   * @returns {Array} Dados consolidados
   */
  consolidateDataByProduct(campaignsData, quotationData, date) {
    const consolidatedMap = new Map();

    // Processar dados de campaigns
    campaignsData.forEach(campaign => {
      const key = campaign.productName.toLowerCase();
      
      if (!consolidatedMap.has(key)) {
        consolidatedMap.set(key, {
          productName: campaign.productName,
          date: date,
          // Dados de campaigns
          totalSpend: 0,
          cpc: 0,
          clicks: 0,
          impressions: 0,
          productLink: campaign.productLink,
          marketType: campaign.marketType,
          // Dados de quotation (inicialmente vazios)
          price: campaign.productPrice || 0,
          cogs: campaign.cogs || 0,
          unitsSold: 0,
          totalSales: 0,
          numberOfSales: 0,
          shippingTime: '',
          inStock: true,
          imageUrl: '',
          // Fontes
          hasCampaignData: false,
          hasQuotationData: false,
          sources: []
        });
      }

      const consolidated = consolidatedMap.get(key);
      
      // Somar dados de campanhas (pode haver múltiplas campanhas para o mesmo produto)
      consolidated.totalSpend += campaign.totalSpend;
      consolidated.cpc = campaign.cpc; // Usar o último CPC
      consolidated.clicks += campaign.clicks;
      consolidated.impressions += campaign.impressions;
      consolidated.productLink = campaign.productLink;
      consolidated.marketType = campaign.marketType;
      consolidated.price = campaign.productPrice || consolidated.price;
      consolidated.cogs = campaign.cogs || consolidated.cogs;
      consolidated.hasCampaignData = true;
      consolidated.sources.push('campaigns');
    });

    // Processar dados de quotation
    quotationData.forEach(quotation => {
      const key = quotation.productName.toLowerCase();
      
      if (!consolidatedMap.has(key)) {
        consolidatedMap.set(key, {
          productName: quotation.productName,
          date: date,
          // Dados de campaigns (inicialmente vazios)
          totalSpend: 0,
          cpc: 0,
          clicks: 0,
          impressions: 0,
          productLink: '',
          marketType: '',
          // Dados de quotation
          price: quotation.price,
          cogs: quotation.cogs,
          unitsSold: quotation.unitsSold,
          totalSales: quotation.totalSales,
          numberOfSales: quotation.numberOfSales,
          shippingTime: quotation.shippingTime,
          inStock: quotation.inStock,
          imageUrl: quotation.imageUrl,
          // Fontes
          hasCampaignData: false,
          hasQuotationData: false,
          sources: []
        });
      }

      const consolidated = consolidatedMap.get(key);
      
      // Atualizar dados de quotation
      consolidated.price = quotation.price;
      consolidated.cogs = quotation.cogs;
      consolidated.unitsSold = quotation.unitsSold;
      consolidated.totalSales = quotation.totalSales;
      consolidated.numberOfSales = quotation.numberOfSales;
      consolidated.shippingTime = quotation.shippingTime;
      consolidated.inStock = quotation.inStock;
      consolidated.imageUrl = quotation.imageUrl;
      consolidated.hasQuotationData = true;
      consolidated.sources.push('quotation');
    });

    // Converter Map para Array e calcular métricas
    const consolidatedArray = Array.from(consolidatedMap.values()).map(item => {
      return {
        ...item,
        // Calcular métricas derivadas
        totalCog: item.cogs * item.unitsSold,
        storeValue: item.price * item.unitsSold,
        marginBruta: item.price - item.cogs,
        marginEur: (item.price - item.cogs) * item.unitsSold,
        marginPct: item.price > 0 ? ((item.price - item.cogs) / item.price) * 100 : 0,
        roas: item.totalSpend > 0 ? (item.storeValue / item.totalSpend) : 0,
        cpa: item.numberOfSales > 0 ? (item.totalSpend / item.numberOfSales) : 0,
        ber: item.totalSpend > 0 ? (item.totalCog / item.totalSpend) : 0,
        // Status de dados
        dataCompleteness: this.calculateDataCompleteness(item)
      };
    });

    return consolidatedArray;
  }

  /**
   * Calcular completude dos dados
   * @param {Object} item - Item consolidado
   * @returns {Object} Status de completude
   */
  calculateDataCompleteness(item) {
    const hasCampaignData = item.hasCampaignData;
    const hasQuotationData = item.hasQuotationData;
    
    let completeness = 0;
    let missingFields = [];

    if (hasCampaignData) completeness += 50;
    else missingFields.push('Dados de Campanhas');

    if (hasQuotationData) completeness += 50;
    else missingFields.push('Dados de Quotation');

    return {
      percentage: completeness,
      hasCampaignData,
      hasQuotationData,
      missingFields,
      isComplete: completeness === 100
    };
  }

  /**
   * Calcular resumo dos dados consolidados
   * @param {Array} consolidatedData - Dados consolidados
   * @returns {Object} Resumo
   */
  calculateSummary(consolidatedData) {
    if (consolidatedData.length === 0) {
      return this.getEmptySummary();
    }

    const summary = consolidatedData.reduce((acc, item) => {
      acc.totalSpend += item.totalSpend;
      acc.totalRevenue += item.storeValue;
      acc.totalMargin += item.marginEur;
      acc.totalUnitsSold += item.unitsSold;
      acc.totalSales += item.numberOfSales;
      acc.productCount += 1;
      
      // Contar produtos por fonte
      if (item.hasCampaignData) acc.campaignsCount += 1;
      if (item.hasQuotationData) acc.quotationCount += 1;
      if (item.dataCompleteness.isComplete) acc.completeDataCount += 1;
      
      return acc;
    }, {
      totalSpend: 0,
      totalRevenue: 0,
      totalMargin: 0,
      totalUnitsSold: 0,
      totalSales: 0,
      productCount: 0,
      campaignsCount: 0,
      quotationCount: 0,
      completeDataCount: 0
    });

    // Calcular métricas derivadas
    summary.weightedRoas = summary.totalSpend > 0 ? (summary.totalRevenue / summary.totalSpend) : 0;
    summary.averageMargin = summary.productCount > 0 ? (summary.totalMargin / summary.productCount) : 0;
    summary.dataCompleteness = summary.productCount > 0 ? (summary.completeDataCount / summary.productCount) * 100 : 0;

    return summary;
  }

  /**
   * Obter resumo vazio
   * @returns {Object} Resumo vazio
   */
  getEmptySummary() {
    return {
      totalSpend: 0,
      totalRevenue: 0,
      totalMargin: 0,
      totalUnitsSold: 0,
      totalSales: 0,
      productCount: 0,
      campaignsCount: 0,
      quotationCount: 0,
      completeDataCount: 0,
      weightedRoas: 0,
      averageMargin: 0,
      dataCompleteness: 0
    };
  }

  /**
   * Salvar dados consolidados no Daily ROAS
   * @param {Array} consolidatedData - Dados consolidados
   * @param {string} date - Data
   * @returns {Promise<Object>} Resultado da operação
   */
  async saveConsolidatedData(consolidatedData, date) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Utilizador não autenticado');
      }

      // Preparar dados para inserção
      const dataToInsert = consolidatedData.map(item => ({
        user_id: user.user.id,
        date: date,
        product_name: item.productName,
        price: item.price,
        cog: item.cogs,
        units_sold: item.unitsSold,
        total_spend: item.totalSpend,
        cpc: item.cpc,
        atc: item.clicks,
        purchases: item.numberOfSales,
        total_cog: item.totalCog,
        store_value: item.storeValue,
        margin_bruta: item.marginBruta,
        ber: item.ber,
        roas: item.roas,
        cpa: item.cpa,
        margin_eur: item.marginEur,
        margin_pct: item.marginPct,
        source: 'integrated' // Marcar como dados integrados
      }));

      // Inserir dados na tabela daily_roas_data
      const { data, error } = await supabase
        .from('daily_roas_data')
        .upsert(dataToInsert, {
          onConflict: 'user_id,date,product_name'
        })
        .select();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data,
        message: `${dataToInsert.length} produtos salvos com sucesso`
      };

    } catch (error) {
      console.error('❌ Erro ao salvar dados consolidados:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Instância singleton
const dailyRoasIntegrationService = new DailyRoasIntegrationService();
export default dailyRoasIntegrationService;
