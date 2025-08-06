// Facebook Marketing API Integration
// Serviço para comunicação com Facebook Graph API

import corsProxy from './corsProxy';

const FACEBOOK_API_BASE = 'https://graph.facebook.com/v23.0';

class FacebookApiService {
  constructor() {
    this.accessToken = null;
    this.adAccountId = null;
  }

  setCredentials(accessToken, adAccountId) {
    this.accessToken = accessToken;
    this.adAccountId = adAccountId;
  }

  async makeRequest(endpoint, params = {}) {
    if (!this.accessToken) {
      throw new Error('Access token não configurado');
    }

    const url = new URL(`${FACEBOOK_API_BASE}${endpoint}`);
    url.searchParams.append('access_token', this.accessToken);
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });

    try {
      // Tentar usar proxy CORS primeiro
      console.log('Fazendo request para:', url.toString());
      return await corsProxy.makeProxiedRequest(url.toString());
      
    } catch (error) {
      console.error('Erro na API Facebook:', error);
      
      // Se o erro for de CORS ou proxy, mostrar mensagem mais útil
      if (error.message.includes('CORS') || error.message.includes('proxy')) {
        throw new Error('Erro de CORS: Para usar dados reais, é necessário um backend proxy. Usando dados de demonstração.');
      }
      
      throw error;
    }
  }

  // Verificar informações da conta
  async getAccountInfo() {
    if (!this.adAccountId) {
      throw new Error('Account ID não configurado');
    }

    return await this.makeRequest(`/act_${this.adAccountId}`, {
      fields: 'name,currency,account_status,amount_spent,balance,timezone_name'
    });
  }

  // Buscar todas as campanhas (ativas, pausadas, inativas)
  async getCampaigns() {
    if (!this.adAccountId) {
      throw new Error('Account ID não configurado');
    }

    return await this.makeRequest(`/act_${this.adAccountId}/campaigns`, {
      fields: 'id,name,objective,status,effective_status,created_time,updated_time,start_time,stop_time',
      // Remover filtro effective_status para obter todas as campanhas
      limit: 100 // Aumentar limite para obter mais campanhas
    });
  }

  // Buscar insights de uma campanha
  async getCampaignInsights(campaignId, datePreset = 'last_7d') {
    return await this.makeRequest(`/${campaignId}/insights`, {
      fields: 'impressions,clicks,spend,actions,cpc,cpm,ctr,frequency,reach,unique_clicks',
      date_preset: datePreset
    });
  }

  // Buscar insights diários de uma campanha
  async getCampaignDailyInsights(campaignId, dateRange) {
    const params = {
      fields: 'impressions,clicks,spend,actions,cpc,cpm,ctr,date_start,date_stop',
      time_increment: 1 // Dados diários
    };

    if (dateRange) {
      params.time_range = JSON.stringify(dateRange);
    } else {
      params.date_preset = 'last_7d';
    }

    return await this.makeRequest(`/${campaignId}/insights`, params);
  }

  // Buscar todos os ad sets de uma campanha
  async getAdSets(campaignId) {
    return await this.makeRequest(`/${campaignId}/adsets`, {
      fields: 'id,name,status,effective_status,daily_budget,lifetime_budget,targeting',
      limit: 100 // Remover filtro para obter todos os ad sets
    });
  }

  // Buscar todos os ads de um ad set
  async getAds(adSetId) {
    return await this.makeRequest(`/${adSetId}/ads`, {
      fields: 'id,name,status,effective_status,creative',
      limit: 100 // Remover filtro para obter todos os ads
    });
  }

  // Extrair dados de ações (conversões)
  extractActionsData(actions) {
    if (!actions || !Array.isArray(actions)) {
      return { purchases: 0, addToCart: 0, linkClicks: 0 };
    }

    const purchases = actions.find(action => 
      ['purchase', 'offsite_conversion.fb_pixel_purchase'].includes(action.action_type)
    )?.value || '0';

    const addToCart = actions.find(action => 
      ['add_to_cart', 'offsite_conversion.fb_pixel_add_to_cart'].includes(action.action_type)
    )?.value || '0';

    const linkClicks = actions.find(action => 
      action.action_type === 'link_click'
    )?.value || '0';

    return {
      purchases: parseInt(purchases),
      addToCart: parseInt(addToCart),
      linkClicks: parseInt(linkClicks)
    };
  }

  // Converter campanha do Facebook para formato local
  convertCampaignToLocal(fbCampaign, insights = {}) {
    const actions = this.extractActionsData(insights.actions);
    
    return {
      id: `fb_${fbCampaign.id}`,
      name: `${fbCampaign.name} (Facebook)`,
      productName: fbCampaign.name,
      productPrice: 0, // Usuário precisa configurar
      cogs: 0, // Usuário precisa configurar
      marketType: 'low', // Usuário precisa configurar
      market: 'Facebook Ads',
      initialBudget: 0,
      currentBudget: 0,
      createdAt: fbCampaign.created_time,
      facebookCampaignId: fbCampaign.id,
      facebookObjective: fbCampaign.objective,
      facebookStatus: fbCampaign.status,
      days: insights.spend ? [{
        spend: parseFloat(insights.spend || 0),
        sales: actions.purchases,
        atc: actions.addToCart,
        clicks: parseInt(insights.clicks || 0),
        impressions: parseInt(insights.impressions || 0),
        unitsSold: actions.purchases,
        date: new Date().toISOString(),
        dayNumber: 1
      }] : []
    };
  }
}

// Instância singleton
const facebookApi = new FacebookApiService();

export default facebookApi;