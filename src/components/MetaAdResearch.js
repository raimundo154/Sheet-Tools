/**
 * Meta Ad Research Component
 * Integração completa com Meta Ad Library para Product Research
 * Mantém o design system existente da plataforma
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, TrendingUp, Eye, Calendar, Filter, Globe, 
  PlayCircle, Image, Layers, ExternalLink, AlertTriangle,
  Clock, Users, BarChart3, Download, Save, RefreshCw
} from 'lucide-react';
import metaAdLibraryService, { META_CONSTANTS } from '../services/metaAdLibraryApi';
import MetaAdFilters from './MetaAdFilters';
import mockMetaAds from '../data/mockMetaAds';
import './MetaAdResearch.css';

const MetaAdResearch = ({ initialFilters = {} }) => {
  // Estados principais
  const [loading, setLoading] = useState(false);
  const [ads, setAds] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Paginação
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [totalLoaded, setTotalLoaded] = useState(0);

  // Filtros obrigatórios
  const [filters, setFilters] = useState({
    // País obrigatório
    country: initialFilters.country || ['PT'], // Portugal por defeito
    
    // Pesquisa
    q: initialFilters.q || '',
    page_id: initialFilters.page_id || '',
    
    // Estado ativo
    ad_active_status: 'ALL',
    
    // Datas de entrega
    date_min: '',
    date_max: '',
    
    // Dias ativos
    days_active_min: '',
    days_active_max: '',
    
    // Reach
    reach_min: '',
    reach_max: '',
    
    // Tipo de mídia
    media_type: '',
    
    // Plataformas
    publisher_platforms: [],
    
    // Línguas
    languages: [],
    
    // Paginação
    limit: 50,
    after: null
  });

  // Lista de países suportados (ISO-2)
  const countries = [
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
    { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
    { code: 'FR', name: 'França', flag: '🇫🇷' },
    { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
    { code: 'IT', name: 'Itália', flag: '🇮🇹' },
    { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
    { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
    { code: 'AU', name: 'Austrália', flag: '🇦🇺' }
  ];

  // Verificar se país suporta todos os tipos de anúncios
  const supportsAllAdTypes = useCallback((countryCode) => {
    return META_CONSTANTS.EU_UK_COUNTRIES.includes(countryCode);
  }, []);

  // Buscar anúncios
  const searchAds = useCallback(async (resetResults = true, loadMore = false) => {
    if (!filters.country || filters.country.length === 0) {
      setError('Selecione pelo menos um país para pesquisar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // DESENVOLVIMENTO: Usar mock data para testes
      const useMockData = !process.env.REACT_APP_META_ACCESS_TOKEN || process.env.NODE_ENV === 'development';
      
      if (useMockData) {
        console.log('Usando mock data para desenvolvimento/testes');
        
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Converter mock data para estrutura esperada pelo componente
        const convertMockDataToExpectedFormat = (mockAd, index) => {
          // Calcular dias ativos
          const startDate = new Date(mockAd.ad_delivery_start_time);
          const endDate = mockAd.ad_delivery_stop_time ? new Date(mockAd.ad_delivery_stop_time) : new Date();
          const daysActive = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          
          // Estimar reach baseado nas impressões
          let reachEstimated = null;
          if (mockAd.impressions?.lower_bound && mockAd.impressions?.upper_bound) {
            reachEstimated = Math.floor((mockAd.impressions.lower_bound + mockAd.impressions.upper_bound) / 2);
          }
          
          // Determinar tipo de mídia baseado no produto para variedade
          let mediaType = 'IMAGE';
          if (mockAd.page_name?.toLowerCase().includes('netflix') || 
              mockAd.page_name?.toLowerCase().includes('spotify') ||
              mockAd.page_name?.toLowerCase().includes('playstation') ||
              mockAd.ad_creative_bodies?.[0]?.toLowerCase().includes('video')) {
            mediaType = 'VIDEO';
          } else if (mockAd.page_name?.toLowerCase().includes('zara') || 
                     mockAd.page_name?.toLowerCase().includes('h&m') ||
                     mockAd.page_name?.toLowerCase().includes('ikea')) {
            mediaType = 'CAROUSEL';
          }
          
          return {
            ad_archive_id: mockAd.id,
            page_id: mockAd.page_id,
            page_name: mockAd.page_name,
            ad_delivery_start_time: mockAd.ad_delivery_start_time,
            ad_delivery_stop_time: mockAd.ad_delivery_stop_time,
            days_active: daysActive,
            publisher_platforms: mockAd.publisher_platforms || ['facebook'],
            snapshot_url: mockAd.ad_snapshot_url,
            creative_texts: {
              bodies: mockAd.ad_creative_bodies || [],
              titles: mockAd.ad_creative_link_titles || [],
              descriptions: mockAd.ad_creative_link_descriptions || [],
              call_to_actions: mockAd.ad_creative_link_captions || []
            },
            media_type: mediaType,
            reach_estimated: reachEstimated,
            impressions_lower: mockAd.impressions?.lower_bound || null,
            impressions_upper: mockAd.impressions?.upper_bound || null,
            countries: mockAd.delivery_by_region?.map(r => r.region) || ['Portugal'],
            languages: mockAd.languages || ['pt']
          };
        };
        
        // Filtrar mock data baseado nos filtros atuais
        let filteredMockData = mockMetaAds.data.map((mockAd, index) => convertMockDataToExpectedFormat(mockAd, index));
        
        // Aplicar todos os filtros disponíveis
        filteredMockData = filteredMockData.filter(ad => {
          // Filtro de pesquisa por texto
          if (filters.q) {
            const query = filters.q.toLowerCase();
            const matchesText = (
              ad.creative_texts.bodies?.[0]?.toLowerCase().includes(query) ||
              ad.page_name?.toLowerCase().includes(query) ||
              ad.creative_texts.titles?.[0]?.toLowerCase().includes(query) ||
              ad.creative_texts.descriptions?.[0]?.toLowerCase().includes(query)
            );
            if (!matchesText) return false;
          }
          
          // Filtro por Page ID
          if (filters.page_id && !ad.page_id.includes(filters.page_id)) {
            return false;
          }
          
          // Filtro por país
          if (filters.country && filters.country.length > 0) {
            const hasMatchingCountry = filters.country.some(countryCode => {
              // Mapear códigos de país para nomes em português
              const countryNames = {
                'PT': ['Portugal', 'PT'],
                'ES': ['Spain', 'ES', 'Espanha'],
                'FR': ['France', 'FR', 'França'],
                'DE': ['Germany', 'DE', 'Alemanha'],
                'IT': ['Italy', 'IT', 'Itália']
              };
              const possibleNames = countryNames[countryCode] || [countryCode];
              return ad.countries.some(adCountry => 
                possibleNames.some(name => adCountry.toLowerCase().includes(name.toLowerCase()))
              );
            });
            if (!hasMatchingCountry) return false;
          }
          
          // Filtro por status ativo
          if (filters.ad_active_status && filters.ad_active_status !== 'ALL') {
            const now = new Date();
            const endDate = ad.ad_delivery_stop_time ? new Date(ad.ad_delivery_stop_time) : null;
            const isActive = !endDate || endDate > now;
            
            if (filters.ad_active_status === 'ACTIVE' && !isActive) return false;
            if (filters.ad_active_status === 'INACTIVE' && isActive) return false;
          }
          
          // Filtro por dias ativos (min)
          if (filters.days_active_min && ad.days_active < parseInt(filters.days_active_min)) {
            return false;
          }
          
          // Filtro por dias ativos (max)
          if (filters.days_active_max && ad.days_active > parseInt(filters.days_active_max)) {
            return false;
          }
          
          // Filtro por reach (min)
          if (filters.reach_min && ad.reach_estimated && ad.reach_estimated < parseInt(filters.reach_min)) {
            return false;
          }
          
          // Filtro por reach (max)
          if (filters.reach_max && ad.reach_estimated && ad.reach_estimated > parseInt(filters.reach_max)) {
            return false;
          }
          
          // Filtro por tipo de mídia
          if (filters.media_type && filters.media_type !== 'ALL' && ad.media_type !== filters.media_type) {
            return false;
          }
          
          // Filtro por data de início
          if (filters.date_min) {
            const adStartDate = new Date(ad.ad_delivery_start_time);
            const filterStartDate = new Date(filters.date_min);
            if (adStartDate < filterStartDate) return false;
          }
          
          // Filtro por data de fim
          if (filters.date_max) {
            const adStartDate = new Date(ad.ad_delivery_start_time);
            const filterEndDate = new Date(filters.date_max);
            if (adStartDate > filterEndDate) return false;
          }
          
          // Filtro por plataformas
          if (filters.publisher_platforms && filters.publisher_platforms.length > 0) {
            const hasMatchingPlatform = filters.publisher_platforms.some(platform => 
              ad.publisher_platforms.map(p => p.toLowerCase()).includes(platform.toLowerCase())
            );
            if (!hasMatchingPlatform) return false;
          }
          
          // Filtro por idiomas
          if (filters.languages && filters.languages.length > 0) {
            const hasMatchingLanguage = filters.languages.some(lang => 
              ad.languages.includes(lang)
            );
            if (!hasMatchingLanguage) return false;
          }
          
          return true;
        });
        
        // Paginação simulada
        const pageSize = 20;
        const startIndex = loadMore ? ads.length : 0;
        const endIndex = startIndex + pageSize;
        const pageData = filteredMockData.slice(startIndex, endIndex);
        
        if (resetResults) {
          setAds(pageData);
          setTotalLoaded(pageData.length);
        } else {
          setAds(prev => [...prev, ...pageData]);
          setTotalLoaded(prev => prev + pageData.length);
        }
        
        // Configurar paginação
        setHasNextPage(endIndex < filteredMockData.length);
        setNextCursor(endIndex < filteredMockData.length ? `mock_cursor_${endIndex}` : null);
        
        // Estatísticas simuladas para mock data
        if (resetResults) {
          // Calcular estatísticas reais dos dados filtrados
          const mediaTypeCounts = {};
          const platformCounts = {};
          const countryCounts = {};
          let totalDaysActive = 0;
          const allDates = [];
          
          filteredMockData.forEach(ad => {
            // Contar tipos de mídia
            mediaTypeCounts[ad.media_type] = (mediaTypeCounts[ad.media_type] || 0) + 1;
            
            // Contar plataformas
            ad.publisher_platforms.forEach(platform => {
              platformCounts[platform] = (platformCounts[platform] || 0) + 1;
            });
            
            // Contar países
            ad.countries.forEach(country => {
              countryCounts[country] = (countryCounts[country] || 0) + 1;
            });
            
            // Somar dias ativos
            totalDaysActive += ad.days_active;
            
            // Coletar datas
            if (ad.ad_delivery_start_time) {
              allDates.push(new Date(ad.ad_delivery_start_time));
            }
          });
          
          // Determinar range de datas
          allDates.sort();
          const dateRange = allDates.length > 0 ? {
            earliest: allDates[0].toISOString().split('T')[0],
            latest: allDates[allDates.length - 1].toISOString().split('T')[0]
          } : null;
          
          const mockStats = {
            total_ads: filteredMockData.length,
            media_types: mediaTypeCounts,
            publisher_platforms: platformCounts,
            countries: countryCounts,
            avg_days_active: filteredMockData.length > 0 ? Math.round(totalDaysActive / filteredMockData.length) : 0,
            date_range: dateRange
          };
          setStats(mockStats);
        }
        
        return;
      }

      // PRODUÇÃO: Usar API real da Meta
      const searchFilters = {
        ...filters,
        after: loadMore ? nextCursor : null,
        country: Array.isArray(filters.country) ? filters.country : [filters.country]
      };

      const response = await metaAdLibraryService.searchAds(searchFilters);

      if (resetResults) {
        setAds(response.data);
        setTotalLoaded(response.data.length);
      } else {
        setAds(prev => [...prev, ...response.data]);
        setTotalLoaded(prev => prev + response.data.length);
      }

      // Configurar paginação
      setHasNextPage(!!response.paging?.cursors?.after);
      setNextCursor(response.paging?.cursors?.after || null);

      // Atualizar estatísticas se for pesquisa nova
      if (resetResults) {
        const statsData = await metaAdLibraryService.getStats(searchFilters);
        setStats(statsData);
      }

    } catch (error) {
      console.error('Search error:', error);
      setError(error.message);
      if (resetResults) {
        setAds([]);
        setStats(null);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, nextCursor, ads.length]);

  // Carregar mais resultados
  const loadMoreAds = useCallback(() => {
    if (hasNextPage && !loading) {
      searchAds(false, true);
    }
  }, [hasNextPage, loading, searchAds]);

  // Aplicar filtros
  const handleFiltersChange = (newFilters) => {
    setFilters({ ...newFilters, after: null });
    setShowFilters(false);
  };

  // Buscar quando filtros mudarem
  useEffect(() => {
    if (filters.country.length > 0) {
      searchAds(true, false);
    }
  }, [searchAds]);

  // Exportar resultados CSV
  const exportToCSV = () => {
    if (ads.length === 0) return;

    const headers = [
      'ID do Anúncio',
      'Página',
      'Início da Entrega',
      'Fim da Entrega', 
      'Dias Ativos',
      'Tipo de Mídia',
      'Plataformas',
      'Países',
      'Reach Estimado',
      'URL Snapshot'
    ];

    const csvContent = [
      headers.join(','),
      ...ads.map(ad => [
        ad.ad_archive_id,
        `"${ad.page_name}"`,
        ad.ad_delivery_start_time,
        ad.ad_delivery_stop_time || 'Ativo',
        ad.days_active,
        ad.media_type,
        `"${ad.publisher_platforms.join(', ')}"`,
        `"${ad.countries.join(', ')}"`,
        ad.reach_estimated || 'N/A',
        ad.snapshot_url
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `meta-ads-research-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Renderizar card de anúncio
  const renderAdCard = (ad) => (
    <div key={ad.ad_archive_id} className="meta-ad-card">
      {/* Preview */}
      <div className="ad-preview">
        <div className="ad-snapshot">
          {ad.snapshot_url ? (
            <img 
              src={ad.snapshot_url} 
              alt="Ad Preview"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="snapshot-fallback" style={{ display: 'none' }}>
            <Eye size={24} />
            <span>Preview não disponível</span>
          </div>
        </div>

        {/* Badges */}
        <div className="ad-badges">
          <span className={`media-badge ${ad.media_type.toLowerCase()}`}>
            {ad.media_type === 'VIDEO' && <PlayCircle size={12} />}
            {ad.media_type === 'IMAGE' && <Image size={12} />}
            {ad.media_type === 'CAROUSEL' && <Layers size={12} />}
            {ad.media_type}
          </span>
          
          <span className="days-badge">
            <Clock size={12} />
            {ad.days_active}d
          </span>
        </div>

        {/* Ações */}
        <div className="ad-actions">
          <button 
            className="action-btn"
            onClick={() => window.open(ad.snapshot_url, '_blank')}
            disabled={!ad.snapshot_url}
            title="Ver anúncio original"
          >
            <ExternalLink size={16} />
          </button>
          
          <button className="action-btn" title="Salvar anúncio">
            <Save size={16} />
          </button>
        </div>
      </div>

      {/* Informações */}
      <div className="ad-info">
        <div className="ad-header">
          <h3 className="ad-page-name">{ad.page_name}</h3>
          <span className="ad-id">#{ad.ad_archive_id}</span>
        </div>

        {/* Métricas principais */}
        <div className="ad-metrics">
          <div className="metric">
            <Users size={14} />
            <span>
              {ad.reach_estimated 
                ? `${(ad.reach_estimated / 1000).toFixed(1)}K reach` 
                : `${ad.impressions_lower || 'N/A'}-${ad.impressions_upper || 'N/A'} impressões`
              }
            </span>
          </div>
          
          <div className="metric">
            <Globe size={14} />
            <span>{ad.countries.slice(0, 3).join(', ')}{ad.countries.length > 3 ? '...' : ''}</span>
          </div>
        </div>

        {/* Plataformas */}
        <div className="ad-platforms">
          {ad.publisher_platforms.map(platform => (
            <span key={platform} className={`platform-tag ${platform.toLowerCase()}`}>
              {platform}
            </span>
          ))}
        </div>

        {/* Texto criativo (sample) */}
        {ad.creative_texts.bodies.length > 0 && (
          <div className="ad-creative-preview">
            <p>"{ad.creative_texts.bodies[0].substring(0, 100)}..."</p>
          </div>
        )}

        {/* Timeline */}
        <div className="ad-timeline">
          <div className="timeline-item">
            <Calendar size={12} />
            <span>Início: {new Date(ad.ad_delivery_start_time).toLocaleDateString('pt-PT')}</span>
          </div>
          {ad.ad_delivery_stop_time && (
            <div className="timeline-item">
              <Calendar size={12} />
              <span>Fim: {new Date(ad.ad_delivery_stop_time).toLocaleDateString('pt-PT')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="meta-ad-research">
      {/* Header */}
      <div className="research-header">
        <div className="header-content">
          <div className="title-section">
            <h2>Ad Research (Meta)</h2>
            <p>Pesquisa avançada de anúncios usando Meta Ad Library</p>
          </div>
          
          <div className="header-actions">
            <button 
              className="filter-btn"
              onClick={() => setShowFilters(true)}
            >
              <Filter size={16} />
              Filtros Avançados
              {Object.values(filters).some(v => 
                (Array.isArray(v) && v.length > 0) || 
                (typeof v === 'string' && v !== '' && v !== 'ALL')
              ) && <span className="filters-indicator" />}
            </button>

            {ads.length > 0 && (
              <button className="export-btn" onClick={exportToCSV}>
                <Download size={16} />
                Exportar CSV
              </button>
            )}
          </div>
        </div>

        {/* Aviso de limitações regionais */}
        {filters.country.some(country => !supportsAllAdTypes(country)) && (
          <div className="region-warning">
            <AlertTriangle size={16} />
            <span>
              Para países fora da UE/Reino Unido, apenas anúncios políticos/sociais estão disponíveis
            </span>
          </div>
        )}
      </div>

      {/* Filtros básicos */}
      <div className="basic-filters">
        <div className="search-section">
          <div className="search-input">
            <Search size={20} />
            <input
              type="text"
              placeholder="Pesquisar por termos, produtos, marcas..."
              value={filters.q}
              onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && searchAds(true)}
            />
          </div>

          <div className="page-input">
            <input
              type="text"
              placeholder="ID da página (opcional)"
              value={filters.page_id}
              onChange={(e) => setFilters(prev => ({ ...prev, page_id: e.target.value }))}
            />
          </div>

          <button 
            className="search-btn" 
            onClick={() => searchAds(true)}
            disabled={loading || filters.country.length === 0}
          >
            {loading ? <RefreshCw size={16} className="spinning" /> : <Search size={16} />}
            Pesquisar
          </button>
        </div>

        {/* Seleção de países */}
        <div className="country-selector">
          <label>Países (obrigatório):</label>
          <div className="country-tags">
            {countries.map(country => (
              <button
                key={country.code}
                className={`country-tag ${filters.country.includes(country.code) ? 'active' : ''}`}
                onClick={() => {
                  const isSelected = filters.country.includes(country.code);
                  setFilters(prev => ({
                    ...prev,
                    country: isSelected 
                      ? prev.country.filter(c => c !== country.code)
                      : [...prev.country, country.code]
                  }));
                }}
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
                {!supportsAllAdTypes(country.code) && (
                  <AlertTriangle size={12} title="Apenas anúncios políticos/sociais" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="research-stats">
          <div className="stat-card">
            <BarChart3 size={20} />
            <div>
              <span className="stat-number">{stats.total_ads}</span>
              <span className="stat-label">Anúncios Encontrados</span>
            </div>
          </div>

          <div className="stat-card">
            <Clock size={20} />
            <div>
              <span className="stat-number">{stats.avg_days_active}d</span>
              <span className="stat-label">Média Dias Ativos</span>
            </div>
          </div>

          <div className="stat-card">
            <TrendingUp size={20} />
            <div>
              <span className="stat-number">
                {Object.keys(stats.media_types).length}
              </span>
              <span className="stat-label">Tipos de Mídia</span>
            </div>
          </div>

          {stats.date_range?.earliest && (
            <div className="stat-card">
              <Calendar size={20} />
              <div>
                <span className="stat-number">
                  {new Date(stats.date_range?.earliest).toLocaleDateString('pt-PT')}
                </span>
                <span className="stat-label">Primeiro Anúncio</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="error-message">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Loading */}
      {loading && ads.length === 0 && (
        <div className="loading-container">
          <RefreshCw size={32} className="spinning" />
          <p>A pesquisar anúncios na Meta Ad Library...</p>
        </div>
      )}

      {/* Resultados */}
      {ads.length > 0 && (
        <>
          <div className="results-header">
            <h3>Resultados da Pesquisa</h3>
            <span className="results-count">
              {totalLoaded} anúncios {hasNextPage && '(mais disponíveis)'}
            </span>
          </div>

          <div className="ads-grid">
            {ads.map(renderAdCard)}
          </div>

          {/* Load more */}
          {hasNextPage && (
            <div className="load-more-container">
              <button 
                className="load-more-btn"
                onClick={loadMoreAds}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="spinning" />
                    A carregar mais...
                  </>
                ) : (
                  <>
                    <TrendingUp size={16} />
                    Carregar Mais Anúncios
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && ads.length === 0 && !error && filters.country.length > 0 && (
        <div className="empty-state">
          <Search size={48} />
          <h3>Nenhum anúncio encontrado</h3>
          <p>Tente ajustar os filtros ou termos de pesquisa</p>
          <button className="retry-btn" onClick={() => searchAds(true)}>
            <RefreshCw size={16} />
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Modal de filtros avançados */}
      {showFilters && (
        <MetaAdFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

export default MetaAdResearch;