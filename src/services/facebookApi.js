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
  async getCampaignInsights(campaignId, datePreset = 'last_7d', dateRange = null) {
    const params = {
      fields: 'impressions,clicks,spend,actions,cpc,cpm,ctr,frequency,reach,unique_clicks'
    };
    
    if (dateRange) {
      params.time_range = JSON.stringify(dateRange);
    } else {
      params.date_preset = datePreset;
    }
    
    return await this.makeRequest(`/${campaignId}/insights`, params);
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

  // PRODUCT RESEARCH METHODS
  
  // Search for trending products based on ad performance
  async searchTrendingProducts(filters = {}) {
    try {
      const {
        dateRange = { since: '2024-01-01', until: new Date().toISOString().split('T')[0] },
        minReach = 1000,
        maxReach = 1000000,
        minSpend = 10,
        maxSpend = 50000,
        minCTR = 0.5,
        maxCTR = 10,
        minCPC = 0.1,
        maxCPC = 5,
        objective = null,
        placements = [],
        ageMin = 18,
        ageMax = 65,
        genders = [],
        countries = [],
        limit = 50
      } = filters;

      const products = [];
      const campaigns = await this.getCampaigns();
      
      for (const campaign of campaigns.data.slice(0, 20)) {
        try {
          // Get campaign insights with detailed metrics
          const insights = await this.getCampaignInsights(campaign.id, null, dateRange);
          
          if (insights.data && insights.data.length > 0) {
            const insight = insights.data[0];
            const reach = parseInt(insight.reach || 0);
            const spend = parseFloat(insight.spend || 0);
            const ctr = parseFloat(insight.ctr || 0);
            const cpc = parseFloat(insight.cpc || 0);
            
            // Apply filters
            if (reach >= minReach && reach <= maxReach &&
                spend >= minSpend && spend <= maxSpend &&
                ctr >= minCTR && ctr <= maxCTR &&
                cpc >= minCPC && cpc <= maxCPC) {
              
              // Get ad sets and ads for more detailed info
              const adSets = await this.getAdSets(campaign.id);
              const productInfo = await this.extractProductInfo(campaign, adSets.data, insight);
              
              if (productInfo) {
                products.push(productInfo);
              }
            }
          }
        } catch (error) {
          console.warn(`Error processing campaign ${campaign.id}:`, error.message);
        }
      }
      
      // Sort by trend score and return top results
      return products
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, limit);
        
    } catch (error) {
      throw new Error(`Error searching trending products: ${error.message}`);
    }
  }
  
  // Extract product information from campaign data
  async extractProductInfo(campaign, adSets, insights) {
    try {
      const actions = this.extractActionsData(insights.actions);
      
      // Calculate trend score based on performance metrics
      const trendScore = this.calculateTrendScore({
        reach: parseInt(insights.reach || 0),
        ctr: parseFloat(insights.ctr || 0),
        frequency: parseFloat(insights.frequency || 0),
        spend: parseFloat(insights.spend || 0),
        purchases: actions.purchases
      });
      
      // Extract targeting information from ad sets
      let targetingInfo = {};
      if (adSets && adSets.length > 0) {
        const targeting = adSets[0].targeting || {};
        targetingInfo = {
          ageMin: targeting.age_min || 18,
          ageMax: targeting.age_max || 65,
          genders: targeting.genders || [],
          countries: targeting.geo_locations?.countries || [],
          interests: targeting.interests || []
        };
      }
      
      // Estimate profit margin based on industry standards
      const estimatedPrice = this.estimateProductPrice(insights.spend, actions.purchases);
      const estimatedCogs = estimatedPrice * 0.3; // 30% COGS estimation
      const profitMargin = ((estimatedPrice - estimatedCogs - parseFloat(insights.cpc || 0)) / estimatedPrice * 100).toFixed(0);
      
      return {
        id: `product_${campaign.id}`,
        name: this.cleanProductName(campaign.name),
        category: this.categorizeProduct(campaign.name, campaign.objective),
        price: estimatedPrice,
        originalPrice: estimatedPrice * 1.5, // Assume 50% discount
        discount: 33,
        rating: this.calculateRating(insights.ctr, actions.purchases, insights.clicks),
        reviews: Math.floor(actions.purchases * 5.2), // Estimate reviews
        sold: actions.purchases,
        trend: this.getTrendType(trendScore, insights.frequency),
        image: `https://picsum.photos/300/200?random=${campaign.id}`,
        tags: this.extractTags(campaign.name, targetingInfo),
        profit_margin: `${Math.max(0, profitMargin)}%`,
        competition: this.assessCompetition(insights.frequency, insights.cpc),
        trendScore,
        // Facebook specific data
        facebook: {
          campaignId: campaign.id,
          objective: campaign.objective,
          reach: parseInt(insights.reach || 0),
          impressions: parseInt(insights.impressions || 0),
          clicks: parseInt(insights.clicks || 0),
          spend: parseFloat(insights.spend || 0),
          ctr: parseFloat(insights.ctr || 0),
          cpc: parseFloat(insights.cpc || 0),
          cpm: parseFloat(insights.cpm || 0),
          frequency: parseFloat(insights.frequency || 0),
          purchases: actions.purchases,
          addToCart: actions.addToCart
        },
        targeting: targetingInfo
      };
    } catch (error) {
      console.error('Error extracting product info:', error);
      return null;
    }
  }
  
  // Calculate trend score based on multiple metrics
  calculateTrendScore({ reach, ctr, frequency, spend, purchases }) {
    const reachScore = Math.min(reach / 10000, 10);
    const ctrScore = Math.min(ctr * 2, 10);
    const frequencyScore = Math.min(frequency * 2, 10);
    const spendScore = Math.min(spend / 1000, 10);
    const conversionScore = purchases > 0 ? Math.min(purchases / 10, 10) : 0;
    
    return ((reachScore + ctrScore + frequencyScore + spendScore + conversionScore) / 5).toFixed(1);
  }
  
  // Clean product name for display
  cleanProductName(name) {
    return name
      .replace(/[^\w\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .slice(0, 4)
      .join(' ');
  }
  
  // Categorize product based on name and objective
  categorizeProduct(name, objective) {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('phone') || nameLower.includes('tech') || nameLower.includes('gadget')) {
      return 'electronics';
    } else if (nameLower.includes('cloth') || nameLower.includes('fashion') || nameLower.includes('wear')) {
      return 'clothing';
    } else if (nameLower.includes('home') || nameLower.includes('kitchen') || nameLower.includes('decor')) {
      return 'home';
    } else if (nameLower.includes('beauty') || nameLower.includes('skin') || nameLower.includes('health')) {
      return 'health';
    } else if (nameLower.includes('sport') || nameLower.includes('fitness') || nameLower.includes('gym')) {
      return 'sports';
    }
    return 'general';
  }
  
  // Calculate rating based on performance
  calculateRating(ctr, purchases, clicks) {
    let rating = 3.5; // Base rating
    
    if (ctr > 2) rating += 0.5;
    if (ctr > 5) rating += 0.5;
    if (purchases / clicks > 0.05) rating += 0.5; // Good conversion rate
    
    return Math.min(5, Math.max(3, rating)).toFixed(1);
  }
  
  // Get trend type based on score
  getTrendType(score, frequency) {
    if (score > 7 && frequency > 1.5) return 'hot';
    if (score > 5) return 'rising';
    return 'steady';
  }
  
  // Extract tags from product name and targeting
  extractTags(name, targeting) {
    const tags = [];
    const nameLower = name.toLowerCase();
    
    // Add tags based on name
    if (nameLower.includes('smart')) tags.push('Smart');
    if (nameLower.includes('wireless')) tags.push('Wireless');
    if (nameLower.includes('led')) tags.push('LED');
    if (nameLower.includes('fitness')) tags.push('Fitness');
    if (nameLower.includes('eco')) tags.push('Eco-friendly');
    
    // Add tags based on targeting
    if (targeting.ageMin <= 25) tags.push('Youth');
    if (targeting.ageMax >= 55) tags.push('Mature');
    if (targeting.genders && targeting.genders.includes(1)) tags.push('Women');
    if (targeting.genders && targeting.genders.includes(2)) tags.push('Men');
    
    return tags.slice(0, 3); // Limit to 3 tags
  }
  
  // Assess competition level
  assessCompetition(frequency, cpc) {
    if (frequency > 2 && cpc > 2) return 'High';
    if (frequency > 1 || cpc > 1) return 'Medium';
    return 'Low';
  }
  
  // Estimate product price based on ad spend and purchases
  estimateProductPrice(spend, purchases) {
    if (purchases === 0) return 25; // Default price
    
    const costPerPurchase = spend / purchases;
    // Assume 3-5x ROAS for profitable products
    return Math.max(10, Math.round(costPerPurchase * 4));
  }
  
  // Get campaign insights with date range
  async getCampaignInsightsWithRange(campaignId, dateRange) {
    const params = {
      fields: 'impressions,clicks,spend,actions,cpc,cpm,ctr,frequency,reach,unique_clicks',
    };
    
    if (dateRange) {
      params.time_range = JSON.stringify(dateRange);
    } else {
      params.date_preset = 'last_30d';
    }
    
    return await this.makeRequest(`/${campaignId}/insights`, params);
  }
  
  // Get audience insights for targeting analysis
  async getAudienceInsights(campaignId, breakdown = 'age,gender') {
    return await this.makeRequest(`/${campaignId}/insights`, {
      fields: 'impressions,clicks,spend,ctr,cpc',
      breakdowns: breakdown,
      date_preset: 'last_30d'
    });
  }
  
  // Get ad creatives for a campaign
  async getCampaignCreatives(campaignId) {
    try {
      const adSets = await this.getAdSets(campaignId);
      const creatives = [];
      
      for (const adSet of adSets.data) {
        const ads = await this.getAds(adSet.id);
        for (const ad of ads.data) {
          if (ad.creative) {
            creatives.push({
              id: ad.creative.id,
              name: ad.name,
              creative: ad.creative
            });
          }
        }
      }
      
      return creatives;
    } catch (error) {
      console.error('Error getting creatives:', error);
      return [];
    }
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