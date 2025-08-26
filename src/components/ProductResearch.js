/**
 * Product Research - Enhanced with filtering interface
 * Integrates country selector, keywords search, and KPI dropdowns
 */

import React, { useState, useCallback } from 'react';
import { Search, TrendingUp, Filter, Globe, BarChart3, ChevronDown } from 'lucide-react';
import MetaAdResearch from './MetaAdResearch';
import './ProductResearch.css';

const ProductResearch = () => {
  // Estados para os filtros
  const [selectedCountry, setSelectedCountry] = useState('');
  const [keywords, setKeywords] = useState('');
  const [selectedKPI, setSelectedKPI] = useState('profit-blueprint');
  const [customKPI, setCustomKPI] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [filteredAds, setFilteredAds] = useState([]);

  // Lista de países suportados
  const countries = [
    { code: 'DK', name: 'Dinamarca', flag: '🇩🇰' },
    { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
    { code: 'FR', name: 'França', flag: '🇫🇷' },
    { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
    { code: 'IT', name: 'Itália', flag: '🇮🇹' },
    { code: 'SE', name: 'Suécia', flag: '🇸🇪' },
    { code: 'NL', name: 'Holanda', flag: '🇳🇱' },
    { code: 'IE', name: 'Irlanda', flag: '🇮🇪' },
    { code: 'FI', name: 'Finlândia', flag: '🇫🇮' }
  ];

  // Dados da Profit Blueprint
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

  // Função para pesquisar
  const handleSearch = useCallback(() => {
    if (!selectedCountry || !keywords.trim()) {
      return;
    }

    // Simular pesquisa e mostrar resultados
    setShowResults(true);
    console.log('Pesquisando:', { country: selectedCountry, keywords, kpi: selectedKPI });
  }, [selectedCountry, keywords, selectedKPI]);

  // Reset quando muda país ou keywords
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
          <p>Descobre anúncios da concorrência e analisa estratégias de marketing</p>
        </div>
      </div>

      {/* Filtering Interface */}
      <div className="search-filters">
        {/* Primeira linha: País + Keywords + Pesquisar */}
        <div className="filters-row filters-main">
          {/* Seletor de País */}
          <div className="filter-group">
            <label htmlFor="country-select">País</label>
            <div className="select-wrapper">
              <select
                id="country-select"
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="filter-select"
              >
                <option value="">Selecionar país...</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="select-icon" size={16} />
            </div>
          </div>

          {/* Barra de Keywords */}
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

          {/* Botão Pesquisar */}
          <div className="filter-group">
            <label>&nbsp;</label>
            <button
              className="search-btn"
              onClick={handleSearch}
              disabled={!selectedCountry || !keywords.trim()}
            >
              <Search size={16} />
              Pesquisar
            </button>
          </div>
        </div>

        {/* Segunda linha: KPIs (apenas mostrar após resultados) */}
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

            {/* KPI Personalizada (placeholder) */}
            <div className="filter-group">
              <label htmlFor="custom-kpi-select">KPI Personalizada</label>
              <div className="select-wrapper">
                <select
                  id="custom-kpi-select"
                  value={customKPI}
                  onChange={(e) => setCustomKPI(e.target.value)}
                  className="filter-select"
                  disabled
                >
                  <option value="">Em breve...</option>
                </select>
                <ChevronDown className="select-icon" size={16} />
              </div>
            </div>

            {/* Informações da Profit Blueprint */}
            {selectedCountry && profitBlueprintData[selectedCountry] && (
              <div className="profit-blueprint-info">
                <div className="blueprint-header">
                  <BarChart3 size={16} />
                  <span>Profit Blueprint - {countries.find(c => c.code === selectedCountry)?.name}</span>
                </div>
                <div className="blueprint-values">
                  {Object.entries(profitBlueprintData[selectedCountry]).map(([days, value]) => (
                    <span key={days} className="blueprint-value">
                      {days} dias: <strong>{value}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Componente Meta Ad Research (apenas mostrar se há resultados) */}
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
            <h3>Pronto para pesquisar</h3>
            <p>Selecione um país e digite keywords para começar a pesquisa de anúncios</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductResearch;