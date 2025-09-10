/**
 * Meta Ad Research Component
 * Complete integration with Meta Ad Library for Product Research
 * Maintains the platform's existing design system
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
  // Main states
  const [loading, setLoading] = useState(false);
  const [ads, setAds] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [totalLoaded, setTotalLoaded] = useState(0);

  // Required filters
  const [filters, setFilters] = useState({
    // Required country
    country: initialFilters.country || ['PT'], // Portugal by default
    
    // Search
    q: initialFilters.q || '',
    page_id: initialFilters.page_id || '',
    
    // Active status
    ad_active_status: 'ALL',
    
    // Delivery dates
    date_min: '',
    date_max: '',
    
    // Active days
    days_active_min: '',
    days_active_max: '',
    
    // Reach
    reach_min: '',
    reach_max: '',
    
    // Media type
    media_type: '',
    
    // Platforms
    publisher_platforms: [],
    
    // Languages
    languages: [],
    
    // Pagination
    limit: 50,
    after: null
  });

  // List of supported countries (ISO-2)
  const countries = [
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' }
  ];

  // Check if country supports all ad types
  const supportsAllAdTypes = useCallback((countryCode) => {
    return META_CONSTANTS.EU_UK_COUNTRIES.includes(countryCode);
  }, []);

  // Search ads
  const searchAds = useCallback(async (resetResults = true, loadMore = false) => {
    if (!filters.country || filters.country.length === 0) {
      setError('Select at least one country to search');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // DEVELOPMENT: Use mock data for testing
      const useMockData = !process.env.REACT_APP_META_ACCESS_TOKEN || process.env.NODE_ENV === 'development';
      
      if (useMockData) {
        console.log('Using mock data for development/testing');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Convert mock data to expected component structure
        const convertMockDataToExpectedFormat = (mockAd, index) => {
          // Calculate active days
          const startDate = new Date(mockAd.ad_delivery_start_time);
          const endDate = mockAd.ad_delivery_stop_time ? new Date(mockAd.ad_delivery_stop_time) : new Date();
          const daysActive = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          
          // Estimate reach based on impressions
          let reachEstimated = null;
          if (mockAd.impressions?.lower_bound && mockAd.impressions?.upper_bound) {
            reachEstimated = Math.floor((mockAd.impressions.lower_bound + mockAd.impressions.upper_bound) / 2);
          }
          
          // Determine media type based on product for variety
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
        
        // Filter mock data based on current filters
        let filteredMockData = mockMetaAds.data.map((mockAd, index) => convertMockDataToExpectedFormat(mockAd, index));
        
        // Apply all available filters
        filteredMockData = filteredMockData.filter(ad => {
          // Text search filter
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
          
          // Page ID filter
          if (filters.page_id && !ad.page_id.includes(filters.page_id)) {
            return false;
          }
          
          // Country filter
          if (filters.country && filters.country.length > 0) {
            const hasMatchingCountry = filters.country.some(countryCode => {
              // Map country codes to Portuguese names
              const countryNames = {
                'PT': ['Portugal', 'PT'],
                'ES': ['Spain', 'ES', 'España'],
                'FR': ['France', 'FR', 'Francia'],
                'DE': ['Germany', 'DE', 'Deutschland'],
                'IT': ['Italy', 'IT', 'Italia']
              };
              const possibleNames = countryNames[countryCode] || [countryCode];
              return ad.countries.some(adCountry => 
                possibleNames.some(name => adCountry.toLowerCase().includes(name.toLowerCase()))
              );
            });
            if (!hasMatchingCountry) return false;
          }
          
          // Active status filter
          if (filters.ad_active_status && filters.ad_active_status !== 'ALL') {
            const now = new Date();
            const endDate = ad.ad_delivery_stop_time ? new Date(ad.ad_delivery_stop_time) : null;
            const isActive = !endDate || endDate > now;
            
            if (filters.ad_active_status === 'ACTIVE' && !isActive) return false;
            if (filters.ad_active_status === 'INACTIVE' && isActive) return false;
          }
          
          // Active days filter (min)
          if (filters.days_active_min && ad.days_active < parseInt(filters.days_active_min)) {
            return false;
          }
          
          // Active days filter (max)
          if (filters.days_active_max && ad.days_active > parseInt(filters.days_active_max)) {
            return false;
          }
          
          // Reach filter (min)
          if (filters.reach_min && ad.reach_estimated && ad.reach_estimated < parseInt(filters.reach_min)) {
            return false;
          }
          
          // Reach filter (max)
          if (filters.reach_max && ad.reach_estimated && ad.reach_estimated > parseInt(filters.reach_max)) {
            return false;
          }
          
          // Media type filter
          if (filters.media_type && filters.media_type !== 'ALL' && ad.media_type !== filters.media_type) {
            return false;
          }
          
          // Start date filter
          if (filters.date_min) {
            const adStartDate = new Date(ad.ad_delivery_start_time);
            const filterStartDate = new Date(filters.date_min);
            if (adStartDate < filterStartDate) return false;
          }
          
          // End date filter
          if (filters.date_max) {
            const adStartDate = new Date(ad.ad_delivery_start_time);
            const filterEndDate = new Date(filters.date_max);
            if (adStartDate > filterEndDate) return false;
          }
          
          // Platforms filter
          if (filters.publisher_platforms && filters.publisher_platforms.length > 0) {
            const hasMatchingPlatform = filters.publisher_platforms.some(platform => 
              ad.publisher_platforms.map(p => p.toLowerCase()).includes(platform.toLowerCase())
            );
            if (!hasMatchingPlatform) return false;
          }
          
          // Languages filter
          if (filters.languages && filters.languages.length > 0) {
            const hasMatchingLanguage = filters.languages.some(lang => 
              ad.languages.includes(lang)
            );
            if (!hasMatchingLanguage) return false;
          }
          
          return true;
        });
        
        // Simulated pagination
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
        
        // Configure pagination
        setHasNextPage(endIndex < filteredMockData.length);
        setNextCursor(endIndex < filteredMockData.length ? `mock_cursor_${endIndex}` : null);
        
        // Simulated statistics for mock data
        if (resetResults) {
          // Calculate real statistics from filtered data
          const mediaTypeCounts = {};
          const platformCounts = {};
          const countryCounts = {};
          let totalDaysActive = 0;
          const allDates = [];
          
          filteredMockData.forEach(ad => {
            // Count media types
            mediaTypeCounts[ad.media_type] = (mediaTypeCounts[ad.media_type] || 0) + 1;
            
            // Count platforms
            ad.publisher_platforms.forEach(platform => {
              platformCounts[platform] = (platformCounts[platform] || 0) + 1;
            });
            
            // Count countries
            ad.countries.forEach(country => {
              countryCounts[country] = (countryCounts[country] || 0) + 1;
            });
            
            // Sum active days
            totalDaysActive += ad.days_active;
            
            // Collect dates
            if (ad.ad_delivery_start_time) {
              allDates.push(new Date(ad.ad_delivery_start_time));
            }
          });
          
          // Determine date range
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

      // PRODUCTION: Use real Meta API
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

      // Configure pagination
      setHasNextPage(!!response.paging?.cursors?.after);
      setNextCursor(response.paging?.cursors?.after || null);

      // Update statistics if new search
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

  // Load more results
  const loadMoreAds = useCallback(() => {
    if (hasNextPage && !loading) {
      searchAds(false, true);
    }
  }, [hasNextPage, loading, searchAds]);

  // Apply filters
  const handleFiltersChange = (newFilters) => {
    setFilters({ ...newFilters, after: null });
    setShowFilters(false);
  };

  // Search when filters change
  useEffect(() => {
    if (filters.country.length > 0) {
      searchAds(true, false);
    }
  }, [searchAds]);

  // Export CSV results
  const exportToCSV = () => {
    if (ads.length === 0) return;

    const headers = [
      'Ad ID',
      'Page',
      'Start Date',
      'End Date', 
      'Active Days',
      'Media Type',
      'Platforms',
      'Countries',
      'Estimated Reach',
      'Snapshot URL'
    ];

    const csvContent = [
      headers.join(','),
      ...ads.map(ad => [
        ad.ad_archive_id,
        `"${ad.page_name}"`,
        ad.ad_delivery_start_time,
        ad.ad_delivery_stop_time || 'Active',
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

  // Render ad card
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
            <span>Preview not available</span>
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

        {/* Actions */}
        <div className="ad-actions">
          <button 
            className="action-btn"
            onClick={() => window.open(ad.snapshot_url, '_blank')}
            disabled={!ad.snapshot_url}
            title="View original ad"
          >
            <ExternalLink size={16} />
          </button>
          
          <button className="action-btn" title="Save ad">
            <Save size={16} />
          </button>
        </div>
      </div>

      {/* Information */}
      <div className="ad-info">
        <div className="ad-header">
          <h3 className="ad-page-name">{ad.page_name}</h3>
          <span className="ad-id">#{ad.ad_archive_id}</span>
        </div>

        {/* Main metrics */}
        <div className="ad-metrics">
          <div className="metric">
            <Users size={14} />
            <span>
              {ad.reach_estimated 
                ? `${(ad.reach_estimated / 1000).toFixed(1)}K reach` 
                : `${ad.impressions_lower || 'N/A'}-${ad.impressions_upper || 'N/A'} impressions`
              }
            </span>
          </div>
          
          <div className="metric">
            <Globe size={14} />
            <span>{ad.countries.slice(0, 3).join(', ')}{ad.countries.length > 3 ? '...' : ''}</span>
          </div>
        </div>

        {/* Platforms */}
        <div className="ad-platforms">
          {ad.publisher_platforms.map(platform => (
            <span key={platform} className={`platform-tag ${platform.toLowerCase()}`}>
              {platform}
            </span>
          ))}
        </div>

        {/* Creative text (sample) */}
        {ad.creative_texts.bodies.length > 0 && (
          <div className="ad-creative-preview">
            <p>"{ad.creative_texts.bodies[0].substring(0, 100)}..."</p>
          </div>
        )}

        {/* Timeline */}
        <div className="ad-timeline">
          <div className="timeline-item">
            <Calendar size={12} />
            <span>Start: {new Date(ad.ad_delivery_start_time).toLocaleDateString('en-US')}</span>
          </div>
          {ad.ad_delivery_stop_time && (
            <div className="timeline-item">
              <Calendar size={12} />
              <span>End: {new Date(ad.ad_delivery_stop_time).toLocaleDateString('en-US')}</span>
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
            <p>Advanced ad search using Meta Ad Library</p>
          </div>
          
          <div className="header-actions">
            <button 
              className="filter-btn"
              onClick={() => setShowFilters(true)}
            >
              <Filter size={16} />
              Advanced Filters
              {Object.values(filters).some(v => 
                (Array.isArray(v) && v.length > 0) || 
                (typeof v === 'string' && v !== '' && v !== 'ALL')
              ) && <span className="filters-indicator" />}
            </button>

            {ads.length > 0 && (
              <button className="export-btn" onClick={exportToCSV}>
                <Download size={16} />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Regional limitations warning */}
        {filters.country.some(country => !supportsAllAdTypes(country)) && (
          <div className="region-warning">
            <AlertTriangle size={16} />
            <span>
              For countries outside the EU/UK, only political/social ads are available
            </span>
          </div>
        )}
      </div>

      {/* Basic filters */}
      <div className="basic-filters">
        <div className="search-section">
          <div className="search-input">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by terms, products, brands..."
              value={filters.q}
              onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && searchAds(true)}
            />
          </div>

          <div className="page-input">
            <input
              type="text"
              placeholder="Page ID (optional)"
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
            Search
          </button>
        </div>

        {/* Country selection */}
        <div className="country-selector">
          <label>Countries (required):</label>
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
                  <AlertTriangle size={12} title="Only political/social ads" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="research-stats">
          <div className="stat-card">
            <BarChart3 size={20} />
            <div>
              <span className="stat-number">{stats.total_ads}</span>
              <span className="stat-label">Ads Found</span>
            </div>
          </div>

          <div className="stat-card">
            <Clock size={20} />
            <div>
              <span className="stat-number">{stats.avg_days_active}d</span>
              <span className="stat-label">Average Active Days</span>
            </div>
          </div>

          <div className="stat-card">
            <TrendingUp size={20} />
            <div>
              <span className="stat-number">
                {Object.keys(stats.media_types).length}
              </span>
              <span className="stat-label">Media Types</span>
            </div>
          </div>

          {stats.date_range?.earliest && (
            <div className="stat-card">
              <Calendar size={20} />
              <div>
                <span className="stat-number">
                  {new Date(stats.date_range?.earliest).toLocaleDateString('en-US')}
                </span>
                <span className="stat-label">First Ad</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
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
          <p>Searching ads in Meta Ad Library...</p>
        </div>
      )}

      {/* Resultados */}
      {ads.length > 0 && (
        <>
          <div className="results-header">
            <h3>Search Results</h3>
            <span className="results-count">
              {totalLoaded} ads {hasNextPage && '(more available)'}
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
                    Loading more...
                  </>
                ) : (
                  <>
                    <TrendingUp size={16} />
                    Load More Ads
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
          <h3>No ads found</h3>
          <p>Try adjusting the filters or search terms</p>
          <button className="retry-btn" onClick={() => searchAds(true)}>
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      )}

      {/* Advanced filters modal */}
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