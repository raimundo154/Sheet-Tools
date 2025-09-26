// Serviço para gerenciar campanhas do Facebook na base de dados
import { supabase } from '../config/supabase';

class FacebookCampaignsService {
  
  /**
   * Salvar campanha do Facebook na base de dados
   * @param {Object} campaign - Dados da campanha
   * @returns {Promise<Object>} Campanha salva
   */
  async saveCampaign(campaign) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Utilizador não autenticado');
      }

      // Preparar dados da campanha
      const campaignData = {
        user_id: user.user.id,
        facebook_campaign_id: campaign.facebookCampaignId || campaign.id,
        campaign_name: campaign.name,
        objective: campaign.facebookObjective || campaign.objective,
        status: campaign.facebookStatus || campaign.status,
        effective_status: campaign.effectiveStatus,
        product_name: campaign.productName,
        product_price: Number(campaign.productPrice) || 0,
        cogs: Number(campaign.cogs) || 0,
        market_type: campaign.marketType || 'low',
        initial_budget: Number(campaign.initialBudget) || 0,
        current_budget: Number(campaign.currentBudget) || 0
      };

      // Inserir ou atualizar campanha
      const { data, error } = await supabase
        .from('facebook_campaigns')
        .upsert(campaignData, {
          onConflict: 'user_id,facebook_campaign_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar campanha:', error);
        throw error;
      }

      // Salvar dados diários se existirem
      if (campaign.days && campaign.days.length > 0) {
        await this.saveCampaignDays(data.id, campaign.days);
      }

      return data;

    } catch (error) {
      console.error('Erro no saveCampaign:', error);
      throw error;
    }
  }

  /**
   * Salvar dados diários de uma campanha
   * @param {string} campaignId - ID da campanha
   * @param {Array} days - Array de dados diários
   * @returns {Promise<Array>} Dados salvos
   */
  async saveCampaignDays(campaignId, days) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Utilizador não autenticado');
      }

      // Preparar dados diários
      const daysData = days.map(day => ({
        campaign_id: campaignId,
        user_id: user.user.id,
        date: day.date ? day.date.split('T')[0] : new Date().toISOString().split('T')[0],
        spend: Number(day.spend) || 0,
        cpc: Number(day.cpc) || 0,
        clicks: Number(day.clicks) || 0,
        impressions: Number(day.impressions) || 0,
        reach: Number(day.reach) || 0,
        frequency: Number(day.frequency) || 0,
        ctr: Number(day.ctr) || 0,
        cpm: Number(day.cpm) || 0,
        purchases: Number(day.purchases || day.sales) || 0,
        add_to_cart: Number(day.addToCart || day.atc) || 0,
        units_sold: Number(day.unitsSold) || 0
      }));

      // Inserir ou atualizar dados diários
      const { data, error } = await supabase
        .from('facebook_campaign_days')
        .upsert(daysData, {
          onConflict: 'campaign_id,date'
        })
        .select();

      if (error) {
        console.error('Erro ao salvar dados diários:', error);
        throw error;
      }

      return data;

    } catch (error) {
      console.error('Erro no saveCampaignDays:', error);
      throw error;
    }
  }

  /**
   * Obter todas as campanhas do utilizador
   * @returns {Promise<Array>} Lista de campanhas
   */
  async getCampaigns() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Utilizador não autenticado');
      }

      const { data, error } = await supabase
        .from('facebook_campaigns')
        .select(`
          *,
          facebook_campaign_days (*)
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao obter campanhas:', error);
        throw error;
      }

      // Converter para formato esperado pelo frontend
      return data.map(campaign => this.formatCampaignFromDB(campaign));

    } catch (error) {
      console.error('Erro no getCampaigns:', error);
      throw error;
    }
  }

  /**
   * Obter campanhas com dados para uma data específica
   * @param {string} date - Data no formato YYYY-MM-DD
   * @returns {Promise<Array>} Campanhas com dados para a data
   */
  async getCampaignsForDate(date) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Utilizador não autenticado');
      }

      const { data, error } = await supabase
        .from('facebook_campaigns')
        .select(`
          *,
          facebook_campaign_days!inner (*)
        `)
        .eq('user_id', user.user.id)
        .eq('facebook_campaign_days.date', date);

      if (error) {
        console.error('Erro ao obter campanhas para data:', error);
        throw error;
      }

      return data.map(campaign => this.formatCampaignFromDB(campaign));

    } catch (error) {
      console.error('Erro no getCampaignsForDate:', error);
      throw error;
    }
  }

  /**
   * Migrar dados do localStorage para a base de dados
   * @returns {Promise<number>} Número de campanhas migradas
   */
  async migrateFromLocalStorage() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Utilizador não autenticado');
      }

      // Verificar se já existem campanhas na BD
      const existingCampaigns = await this.getCampaigns();
      if (existingCampaigns.length > 0) {
        console.log('Campanhas já existem na base de dados, não é necessário migrar');
        return 0;
      }

      // Obter dados do localStorage (compatibilidade com userService)
      const userService = (await import('./userService')).default;
      const localStorageCampaigns = userService.getUserData('campaigns') || [];

      if (localStorageCampaigns.length === 0) {
        console.log('Nenhuma campanha encontrada no localStorage');
        return 0;
      }

      console.log(`🔄 Migrando ${localStorageCampaigns.length} campanhas do localStorage para a base de dados...`);

      let migratedCount = 0;
      for (const campaign of localStorageCampaigns) {
        try {
          await this.saveCampaign(campaign);
          migratedCount++;
        } catch (error) {
          console.error(`Erro ao migrar campanha ${campaign.name}:`, error);
        }
      }

      console.log(`✅ ${migratedCount} campanhas migradas com sucesso`);
      return migratedCount;

    } catch (error) {
      console.error('Erro na migração:', error);
      throw error;
    }
  }

  /**
   * Converter campanha da base de dados para formato frontend
   * @param {Object} dbCampaign - Campanha da BD
   * @returns {Object} Campanha formatada
   */
  formatCampaignFromDB(dbCampaign) {
    return {
      id: dbCampaign.id,
      name: dbCampaign.campaign_name,
      productName: dbCampaign.product_name,
      productPrice: Number(dbCampaign.product_price),
      cogs: Number(dbCampaign.cogs),
      marketType: dbCampaign.market_type,
      initialBudget: Number(dbCampaign.initial_budget),
      currentBudget: Number(dbCampaign.current_budget),
      facebookCampaignId: dbCampaign.facebook_campaign_id,
      facebookObjective: dbCampaign.objective,
      facebookStatus: dbCampaign.status,
      createdAt: dbCampaign.created_at,
      days: dbCampaign.facebook_campaign_days?.map(day => ({
        date: day.date,
        spend: Number(day.spend),
        cpc: Number(day.cpc),
        clicks: Number(day.clicks),
        impressions: Number(day.impressions),
        reach: Number(day.reach),
        frequency: Number(day.frequency),
        ctr: Number(day.ctr),
        cpm: Number(day.cpm),
        purchases: Number(day.purchases),
        addToCart: Number(day.add_to_cart),
        unitsSold: Number(day.units_sold),
        sales: Number(day.purchases), // Compatibilidade
        atc: Number(day.add_to_cart) // Compatibilidade
      })) || []
    };
  }

  /**
   * Eliminar campanha
   * @param {string} campaignId - ID da campanha
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async deleteCampaign(campaignId) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Utilizador não autenticado');
      }

      const { error } = await supabase
        .from('facebook_campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('user_id', user.user.id);

      if (error) {
        console.error('Erro ao eliminar campanha:', error);
        throw error;
      }

      return true;

    } catch (error) {
      console.error('Erro no deleteCampaign:', error);
      throw error;
    }
  }

  /**
   * Atualizar campanha
   * @param {string} campaignId - ID da campanha
   * @param {Object} updates - Dados para atualizar
   * @returns {Promise<Object>} Campanha atualizada
   */
  async updateCampaign(campaignId, updates) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Utilizador não autenticado');
      }

      const { data, error } = await supabase
        .from('facebook_campaigns')
        .update(updates)
        .eq('id', campaignId)
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar campanha:', error);
        throw error;
      }

      return data;

    } catch (error) {
      console.error('Erro no updateCampaign:', error);
      throw error;
    }
  }
}

// Instância singleton
const facebookCampaignsService = new FacebookCampaignsService();
export default facebookCampaignsService;

