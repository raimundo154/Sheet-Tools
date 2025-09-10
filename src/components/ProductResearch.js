/**
 * Product Research - Enhanced with filtering interface
 * Integrates country selector, keywords search, and KPI dropdowns
 */

import React, { useState, useCallback } from 'react';
import { Search, TrendingUp, Filter, Globe, BarChart3, ChevronDown } from 'lucide-react';
import MetaAdResearch from './MetaAdResearch';
import './ProductResearch.css';

const ProductResearch = () => {
  // Filter states
  const [selectedCountry, setSelectedCountry] = useState('');
  const [keywords, setKeywords] = useState('');
  const [selectedKPI, setSelectedKPI] = useState('profit-blueprint');
  const [customKPI, setCustomKPI] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [filteredAds, setFilteredAds] = useState([]);

  // List of supported countries
  const countries = [
    { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
    { code: 'FI', name: 'Finland', flag: '🇫🇮' }
  ];

  // Profit Blueprint data
  const profitBlueprintData = {
    'DK': { '3-4': '15k', '5-6': '35k', '7-11': '50k', '12-20': '100k', '21-29': '150k', '30+': '200k' },
    'FI': { '3-4': '15k', '5-6': '35k', '7-11': '50k', '12-20': '100k', '21-29': '150k', '30+': '200k' },
    'IE': { '3-4': '15k', '5-6': '35k', '7-11': '50k', '12-20': '100k', '21-29': '150k', '30+': '200k' },
    'NL': { '3-4': '15k', '5-6': '40k', '7-11': '70k', '12-20': '140k', '21-29': '200k', '30+': '280k' },
    'SE': { '3-4': '15k', '5-6': '40k', '7-11': '70k', '12-20': '140k', '21-29': '200k', '30+': '280k' },
    'DE': { '3-4': '15k', '5-6': '35k', '7-11': '50k', '12-20': '100k', '21-29': '150k', '30+': '200k' },
    'FR': { '3-4': 'X', '5-6': 'X', '7-11': '130k', '12-20': '260k', '21-29': '390k', '30+': '520k' },
    'ES': { '3-4': 'X', '5-6': 'X', '7-11': '130k', '12-20': '260k', '21-29': '390k', '30+': '520k' },
    'IT': { '3-4': 'X', '5-6': 'X', '7-11': '130k', '12-20': '260k', '21-29': '390k', '30+': '520k' }
  };

  // Search function
  const handleSearch = useCallback(() => {
    if (!selectedCountry || !keywords.trim()) {
      return;
    }

    // Simulate search and show results
    setShowResults(true);
    console.log('Searching:', { country: selectedCountry, keywords, kpi: selectedKPI });
  }, [selectedCountry, keywords, selectedKPI]);

  // Reset when country or keywords change
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setShowResults(false);
  };

  const handleKeywordsChange = (value) => {
    setKeywords(value);
    setShowResults(false);
  };

  return (
    <div className="product-research">
      {/* Header */}
      <div className="research-header">
        <div className="header-content">
          <h1>Meta Ad Research</h1>
          <p>Discover competitor ads and analyze marketing strategies</p>
        </div>
      </div>

      {/* Filtering Interface */}
      <div className="search-filters">
        {/* First row: Country + Keywords + Search */}
        <div className="filters-row filters-main">
          {/* Country Selector */}
          <div className="filter-group">
            <label htmlFor="country-select">Country</label>
            <div className="select-wrapper">
              <select
                id="country-select"
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="filter-select"
              >
                <option value="">Select country...</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="select-icon" size={16} />
            </div>
          </div>

          {/* Keywords Bar */}
          <div className="filter-group flex-grow">
            <label htmlFor="keywords-input">Keywords</label>
            <div className="search-bar">
              <Search className="search-icon" size={20} />
              <input
                id="keywords-input"
                type="text"
                placeholder="Ex: .de/products, skincare, fitness..."
                value={keywords}
                onChange={(e) => handleKeywordsChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="filter-group">
            <label>&nbsp;</label>
            <button
              className="search-btn"
              onClick={handleSearch}
              disabled={!selectedCountry || !keywords.trim()}
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </div>

        {/* Second row: KPIs (only show after results) */}
        {showResults && (
          <div className="filters-row filters-kpis">
            {/* Profit Blueprint KPI */}
            <div className="filter-group">
              <label htmlFor="kpi-select">KPI - Profit Blueprint</label>
              <div className="select-wrapper">
                <select
                  id="kpi-select"
                  value={selectedKPI}
                  onChange={(e) => setSelectedKPI(e.target.value)}
                  className="filter-select"
                >
                  <option value="profit-blueprint">Profit Blueprint</option>
                </select>
                <ChevronDown className="select-icon" size={16} />
              </div>
            </div>

            {/* Custom KPI (placeholder) */}
            <div className="filter-group">
              <label htmlFor="custom-kpi-select">Custom KPI</label>
              <div className="select-wrapper">
                <select
                  id="custom-kpi-select"
                  value={customKPI}
                  onChange={(e) => setCustomKPI(e.target.value)}
                  className="filter-select"
                  disabled
                >
                  <option value="">Coming soon...</option>
                </select>
                <ChevronDown className="select-icon" size={16} />
              </div>
            </div>

            {/* Profit Blueprint Information */}
            {selectedCountry && profitBlueprintData[selectedCountry] && (
              <div className="profit-blueprint-info">
                <div className="blueprint-header">
                  <BarChart3 size={16} />
                  <span>Profit Blueprint - {countries.find(c => c.code === selectedCountry)?.name}</span>
                </div>
                <div className="blueprint-values">
                  {Object.entries(profitBlueprintData[selectedCountry]).map(([days, value]) => (
                    <span key={days} className="blueprint-value">
                      {days} days: <strong>{value}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Meta Ad Research Component (only show if there are results) */}
      {showResults ? (
        <MetaAdResearch
          initialFilters={{
            country: [selectedCountry],
            q: keywords
          }}
        />
      ) : (
        <div className="no-search-state">
          <div className="no-search-content">
            <Globe size={48} />
            <h3>Ready to search</h3>
            <p>Select a country and enter keywords to start searching ads</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductResearch;