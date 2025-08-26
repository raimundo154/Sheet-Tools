/**
 * Meta Ad Library API Service
 * Integração completa com Graph API /ads_archive
 * Suporta todos os filtros obrigatórios e validações por região
 */

import corsProxy from './corsProxy';

// Configurações da API
const GRAPH_API_VERSION = process.env.REACT_APP_GRAPH_API_VERSION || 'v18.0';
const META_ACCESS_TOKEN = process.env.REACT_APP_META_ACCESS_TOKEN;
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// Países da UE/Reino Unido onde todos os tipos de ads estão disponíveis
const EU_UK_COUNTRIES = [
  'AD', 'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE',
  'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO',
  'SK', 'SI', 'ES', 'SE', 'GB', 'IS', 'LI', 'NO', 'CH'
];

// Plataformas suportadas
const PUBLISHER_PLATFORMS = [
  'FACEBOOK',
  'INSTAGRAM',
  'MESSENGER',
  'WHATSAPP'
];

// Tipos de mídia
const MEDIA_TYPES = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO', 
  CAROUSEL: 'CAROUSEL',
  UNKNOWN: 'UNKNOWN'
};

// Status dos anúncios
const AD_ACTIVE_STATUS = {
  ALL: 'ALL',
  ACTIVE: 'ACTIVE', 
  INACTIVE: 'INACTIVE'
};

class MetaAdLibraryService {
  constructor() {
    this.accessToken = META_ACCESS_TOKEN;
    this.rateLimitRetries = 3;
    this.rateLimitBackoff = 1000; // 1s inicial
  }

  /**
   * Valida se o país suporta todos os tipos de anúncios
   */
  supportsAllAdTypes(country) {
    // Handle array of countries
    if (Array.isArray(country)) {
      return country.every(c => EU_UK_COUNTRIES.includes(c.toUpperCase()));
    }
    // Handle single country string
    if (typeof country === 'string') {
      return EU_UK_COUNTRIES.includes(country.toUpperCase());
    }
    return false;
  }

  /**
   * Calcula dias ativos de um anúncio
   */
  calculateDaysActive(startTime, stopTime) {
    const start = new Date(startTime);
    const end = stopTime ? new Date(stopTime) : new Date();
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Deriva o tipo de mídia baseado nos dados do anúncio
   */
  deriveMediaType(adData) {
    // Primeiro tenta usar o campo nativo se existir
    if (adData.media_type) {
      return adData.media_type.toUpperCase();
    }

    // Deriva baseado na snapshot URL ou outros campos
    if (adData.ad_snapshot_url) {
      // Análise básica da URL - pode ser expandida
      if (adData.ad_snapshot_url.includes('video')) {
        return MEDIA_TYPES.VIDEO;
      }
      if (adData.ad_creative_bodies && adData.ad_creative_bodies.length > 1) {
        return MEDIA_TYPES.CAROUSEL;
      }
    }

    return MEDIA_TYPES.IMAGE; // Default
  }

  /**
   * Estima reach baseado nos campos disponíveis
   */
  estimateReach(adData) {
    // Prioridade: eu_total_reach > impressions (média se for range)
    if (adData.eu_total_reach) {
      return parseInt(adData.eu_total_reach);
    }

    if (adData.impressions) {
      if (typeof adData.impressions === 'string' && adData.impressions.includes('-')) {
        // Range format: "1000-5000"
        const [lower, upper] = adData.impressions.split('-').map(v => parseInt(v.trim()));
        return Math.floor((lower + upper) / 2);
      }
      return parseInt(adData.impressions);
    }

    return null;
  }

  /**
   * Extrai impressions range para anúncios políticos/sociais
   */
  extractImpressionsRange(adData) {
    if (adData.impressions && typeof adData.impressions === 'string' && adData.impressions.includes('-')) {
      const [lower, upper] = adData.impressions.split('-').map(v => parseInt(v.trim()));
      return { lower, upper };
    }
    return { lower: null, upper: null };
  }

  /**
   * Normaliza dados do anúncio
   */
  normalizeAdData(rawAd) {
    const daysActive = this.calculateDaysActive(
      rawAd.ad_delivery_start_time,
      rawAd.ad_delivery_stop_time
    );

    const mediaType = this.deriveMediaType(rawAd);
    const reachEstimated = this.estimateReach(rawAd);
    const impressionsRange = this.extractImpressionsRange(rawAd);

    return {
      ad_archive_id: rawAd.ad_archive_id,
      page_id: rawAd.page_id,
      page_name: rawAd.page_name,
      ad_delivery_start_time: rawAd.ad_delivery_start_time,
      ad_delivery_stop_time: rawAd.ad_delivery_stop_time,
      days_active: daysActive,
      publisher_platforms: rawAd.publisher_platforms || [],
      snapshot_url: rawAd.ad_snapshot_url,
      creative_texts: {
        bodies: rawAd.ad_creative_bodies || [],
        titles: rawAd.ad_creative_link_titles || [],
        descriptions: rawAd.ad_creative_link_descriptions || [],
        call_to_actions: rawAd.ad_creative_link_captions || []
      },
      media_type: mediaType,
      reach_estimated: reachEstimated,
      impressions_lower: impressionsRange.lower,
      impressions_upper: impressionsRange.upper,
      countries: rawAd.ad_reached_countries || [],
      languages: rawAd.languages || [],
      raw: rawAd // Para auditoria
    };
  }

  /**
   * Aplica filtros pós-processamento
   */
  applyPostFilters(ads, filters) {
    return ads.filter(ad => {
      // Filtro dias ativos
      if (filters.days_active_min !== undefined && ad.days_active < filters.days_active_min) {
        return false;
      }
      if (filters.days_active_max !== undefined && ad.days_active > filters.days_active_max) {
        return false;
      }

      // Filtro reach
      if (filters.reach_min !== undefined && (!ad.reach_estimated || ad.reach_estimated < filters.reach_min)) {
        return false;
      }
      if (filters.reach_max !== undefined && (!ad.reach_estimated || ad.reach_estimated > filters.reach_max)) {
        return false;
      }

      // Filtro tipo de mídia
      if (filters.media_type && ad.media_type !== filters.media_type) {
        return false;
      }

      return true;
    });
  }

  /**
   * Constrói parâmetros para Graph API
   */
  buildGraphAPIParams(filters) {
    const params = {
      access_token: this.accessToken,
      fields: [
        'page_id',
        'page_name', 
        'ad_delivery_start_time',
        'ad_delivery_stop_time',
        'ad_creative_bodies',
        'ad_creative_link_titles',
        'ad_creative_link_descriptions',
        'ad_creative_link_captions',
        'ad_snapshot_url',
        'publisher_platforms',
        'languages',
        'eu_total_reach',
        'impressions',
        'ad_reached_countries'
      ].join(','),
      limit: Math.min(filters.limit || 50, 100), // Max 100 per API docs
    };

    // Parâmetros obrigatórios/opcionais
    if (filters.country) {
      params.ad_reached_countries = Array.isArray(filters.country) 
        ? filters.country.join(',') 
        : filters.country;
    }

    if (filters.q) {
      params.search_terms = filters.q;
    }

    if (filters.page_id) {
      params.search_page_ids = filters.page_id;
    }

    if (filters.ad_active_status && filters.ad_active_status !== 'ALL') {
      params.ad_active_status = filters.ad_active_status;
    }

    if (filters.date_min) {
      params.ad_delivery_date_min = filters.date_min;
    }

    if (filters.date_max) {
      params.ad_delivery_date_max = filters.date_max;
    }

    if (filters.publisher_platforms) {
      params.publisher_platforms = Array.isArray(filters.publisher_platforms)
        ? filters.publisher_platforms.join(',')
        : filters.publisher_platforms;
    }

    if (filters.languages) {
      params.content_languages = Array.isArray(filters.languages)
        ? filters.languages.join(',')
        : filters.languages;
    }

    if (filters.after) {
      params.after = filters.after;
    }

    // Para países fora UE/UK, força anúncios políticos/sociais
    if (filters.country && !this.supportsAllAdTypes(filters.country)) {
      params.ad_type = 'POLITICAL_AND_ISSUE_ADS';
    }

    return params;
  }

  /**
   * Faz request com backoff para rate limiting
   */
  async makeRequestWithBackoff(url, params, attempt = 1) {
    try {
      console.log(`Meta Ad Library API Request (attempt ${attempt}):`, { url, params });
      
      // Construir URL com parâmetros
      const urlWithParams = new URL(url);
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          urlWithParams.searchParams.append(key, params[key]);
        }
      });
      
      // Usar proxy CORS se necessário
      const response = await corsProxy.makeProxiedRequest(urlWithParams.toString());

      return response;
    } catch (error) {
      // Rate limiting (HTTP 429 or specific Facebook errors)
      const isRateLimit = (
        error.status === 429 ||
        error.message?.includes('429') ||
        (error.error && (error.error.code === 4 || error.error.code === 17))
      );
      
      if (isRateLimit && attempt <= this.rateLimitRetries) {
        const retryAfter = error.retryAfter || error.headers?.['retry-after'];
        const backoffTime = retryAfter ? parseInt(retryAfter) * 1000 : this.rateLimitBackoff * attempt;
        
        console.warn(`Rate limited, retrying in ${backoffTime}ms (attempt ${attempt})`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        
        return this.makeRequestWithBackoff(url, params, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * ENDPOINT 1: Pesquisa principal de anúncios
   */
  async searchAds(filters) {
    try {
      // Validação obrigatória do país
      if (!filters.country) {
        throw new Error('País é obrigatório para pesquisa de anúncios');
      }

      const params = this.buildGraphAPIParams(filters);
      const url = `${GRAPH_API_BASE}/ads_archive`;
      
      const response = await this.makeRequestWithBackoff(url, params);
      
      // Normalizar dados
      const normalizedAds = response.data.map(ad => this.normalizeAdData(ad));
      
      // Aplicar filtros pós-processamento
      const filteredAds = this.applyPostFilters(normalizedAds, filters);

      return {
        data: filteredAds,
        paging: response.paging || {},
        meta: {
          total_count: filteredAds.length,
          filters_applied: filters,
          region_info: {
            supports_all_ad_types: this.supportsAllAdTypes(filters.country),
            forced_political_ads: !this.supportsAllAdTypes(filters.country)
          }
        }
      };

    } catch (error) {
      console.error('Meta Ad Library search error:', error);
      throw new Error(`Erro na pesquisa de anúncios: ${error.message}`);
    }
  }

  /**
   * ENDPOINT 2: Detalhe de anúncio específico
   */
  async getAdDetails(adArchiveId, country) {
    try {
      if (!country) {
        throw new Error('País é obrigatório para buscar detalhes do anúncio');
      }

      const params = {
        access_token: this.accessToken,
        fields: [
          'page_id', 'page_name', 'ad_delivery_start_time', 'ad_delivery_stop_time',
          'ad_creative_bodies', 'ad_creative_link_titles', 'ad_creative_link_descriptions',
          'ad_creative_link_captions', 'ad_snapshot_url', 'publisher_platforms',
          'languages', 'eu_total_reach', 'impressions', 'ad_reached_countries',
          'currency', 'estimated_audience_size'
        ].join(','),
        ad_reached_countries: country
      };

      const url = `${GRAPH_API_BASE}/ads_archive`;
      const response = await this.makeRequestWithBackoff(url, {
        ...params,
        search_terms: adArchiveId // Busca pelo ID
      });

      if (!response.data.length) {
        throw new Error('Anúncio não encontrado');
      }

      return this.normalizeAdData(response.data[0]);

    } catch (error) {
      console.error('Meta Ad Library detail error:', error);
      throw new Error(`Erro ao buscar detalhes: ${error.message}`);
    }
  }

  /**
   * ENDPOINT 3: Pesquisa de páginas/lojas
   */
  async searchPages(query, country) {
    try {
      if (!query || !country) {
        throw new Error('Query e país são obrigatórios para pesquisa de páginas');
      }

      // Nota: Graph API pública não permite pesquisa livre de páginas
      // Este endpoint serve como documentação do fallback
      return {
        message: 'Pesquisa livre de páginas não disponível via Graph API pública',
        suggestion: 'Use o ID da página diretamente se conhecido',
        fallback: {
          manual_input: true,
          format: 'Insira o page_id numérico da página do Facebook'
        }
      };

    } catch (error) {
      console.error('Page search error:', error);
      throw new Error(`Erro na pesquisa de páginas: ${error.message}`);
    }
  }

  /**
   * Obter estatísticas agregadas
   */
  async getStats(filters) {
    try {
      const searchResult = await this.searchAds(filters);
      const ads = searchResult.data;

      const stats = {
        total_ads: ads.length,
        media_types: {},
        publisher_platforms: {},
        countries: {},
        days_active_histogram: {
          '0-7': 0,
          '8-30': 0,
          '31-90': 0,
          '90+': 0
        },
        avg_days_active: 0,
        date_range: {
          earliest: null,
          latest: null
        }
      };

      // Processar estatísticas
      let totalDaysActive = 0;
      const allDates = [];

      ads.forEach(ad => {
        // Media types
        stats.media_types[ad.media_type] = (stats.media_types[ad.media_type] || 0) + 1;

        // Platforms
        ad.publisher_platforms.forEach(platform => {
          stats.publisher_platforms[platform] = (stats.publisher_platforms[platform] || 0) + 1;
        });

        // Countries
        ad.countries.forEach(country => {
          stats.countries[country] = (stats.countries[country] || 0) + 1;
        });

        // Days active histogram
        if (ad.days_active <= 7) stats.days_active_histogram['0-7']++;
        else if (ad.days_active <= 30) stats.days_active_histogram['8-30']++;
        else if (ad.days_active <= 90) stats.days_active_histogram['31-90']++;
        else stats.days_active_histogram['90+']++;

        totalDaysActive += ad.days_active;

        // Date tracking
        if (ad.ad_delivery_start_time) {
          allDates.push(new Date(ad.ad_delivery_start_time));
        }
      });

      // Calcular médias e extremos
      if (ads.length > 0) {
        stats.avg_days_active = Math.round(totalDaysActive / ads.length);
        
        if (allDates.length > 0) {
          allDates.sort();
          stats.date_range.earliest = allDates[0].toISOString().split('T')[0];
          stats.date_range.latest = allDates[allDates.length - 1].toISOString().split('T')[0];
        }
      }

      return stats;

    } catch (error) {
      console.error('Stats calculation error:', error);
      throw new Error(`Erro ao calcular estatísticas: ${error.message}`);
    }
  }

  /**
   * Health check da API
   */
  async healthCheck() {
    try {
      if (!this.accessToken) {
        return {
          status: 'error',
          message: 'Meta Access Token não configurado',
          timestamp: new Date().toISOString()
        };
      }

      // Teste simples com pesquisa básica
      const testParams = {
        access_token: this.accessToken,
        ad_reached_countries: 'US', // País de teste
        limit: 1,
        fields: 'page_id,page_name'
      };

      const url = `${GRAPH_API_BASE}/ads_archive`;
      await this.makeRequestWithBackoff(url, testParams);

      return {
        status: 'healthy',
        message: 'Meta Ad Library API funcionando',
        api_version: GRAPH_API_VERSION,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        status: 'error', 
        message: `Health check falhou: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Constantes para export
export const META_CONSTANTS = {
  MEDIA_TYPES,
  AD_ACTIVE_STATUS,
  PUBLISHER_PLATFORMS,
  EU_UK_COUNTRIES
};

// Instância singleton
const metaAdLibraryService = new MetaAdLibraryService();
export default metaAdLibraryService;