import React, { useState } from 'react';
import { Calendar, Sliders, Target, DollarSign, TrendingUp, Users, MapPin, Smartphone } from 'lucide-react';
import './AdvancedFilters.css';

const AdvancedFilters = ({ filters, onFiltersChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState({
    // Date Range
    dateRange: filters.dateRange || {
      since: '2024-01-01',
      until: new Date().toISOString().split('T')[0]
    },
    
    // Performance Metrics
    minReach: filters.minReach || 1000,
    maxReach: filters.maxReach || 1000000,
    minSpend: filters.minSpend || 10,
    maxSpend: filters.maxSpend || 50000,
    minCTR: filters.minCTR || 0.5,
    maxCTR: filters.maxCTR || 10,
    minCPC: filters.minCPC || 0.1,
    maxCPC: filters.maxCPC || 5,
    minFrequency: filters.minFrequency || 1,
    maxFrequency: filters.maxFrequency || 5,
    
    // Campaign Objectives
    objectives: filters.objectives || [],
    
    // Demographics
    ageMin: filters.ageMin || 18,
    ageMax: filters.ageMax || 65,
    genders: filters.genders || [],
    
    // Geographic
    countries: filters.countries || [],
    
    // Placements
    placements: filters.placements || [],
    
    // Device Platforms
    devicePlatforms: filters.devicePlatforms || [],
    
    // Competition Level
    competitionLevels: filters.competitionLevels || [],
    
    // Trend Types
    trendTypes: filters.trendTypes || []
  });

  const campaignObjectives = [
    { value: 'CONVERSIONS', label: 'Conversões' },
    { value: 'LINK_CLICKS', label: 'Tráfego' },
    { value: 'REACH', label: 'Alcance' },
    { value: 'BRAND_AWARENESS', label: 'Reconhecimento da Marca' },
    { value: 'VIDEO_VIEWS', label: 'Visualizações de Vídeo' },
    { value: 'MESSAGES', label: 'Mensagens' },
    { value: 'APP_INSTALLS', label: 'Instalações de App' },
    { value: 'LEAD_GENERATION', label: 'Geração de Leads' }
  ];

  const placementOptions = [
    { value: 'facebook_feeds', label: 'Facebook Feed' },
    { value: 'instagram_feeds', label: 'Instagram Feed' },
    { value: 'facebook_stories', label: 'Facebook Stories' },
    { value: 'instagram_stories', label: 'Instagram Stories' },
    { value: 'facebook_reels', label: 'Facebook Reels' },
    { value: 'instagram_reels', label: 'Instagram Reels' },
    { value: 'messenger', label: 'Messenger' },
    { value: 'audience_network', label: 'Audience Network' }
  ];

  const devicePlatformOptions = [
    { value: 'mobile', label: 'Mobile' },
    { value: 'desktop', label: 'Desktop' },
    { value: 'tablet', label: 'Tablet' }
  ];

  const countryOptions = [
    { value: 'PT', label: 'Portugal' },
    { value: 'BR', label: 'Brasil' },
    { value: 'ES', label: 'Espanha' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'GB', label: 'Reino Unido' },
    { value: 'FR', label: 'França' },
    { value: 'DE', label: 'Alemanha' },
    { value: 'IT', label: 'Itália' }
  ];

  const handleInputChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, value, checked) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleDateChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      dateRange: {
        since: '2024-01-01',
        until: new Date().toISOString().split('T')[0]
      },
      minReach: 1000,
      maxReach: 1000000,
      minSpend: 10,
      maxSpend: 50000,
      minCTR: 0.5,
      maxCTR: 10,
      minCPC: 0.1,
      maxCPC: 5,
      minFrequency: 1,
      maxFrequency: 5,
      objectives: [],
      ageMin: 18,
      ageMax: 65,
      genders: [],
      countries: [],
      placements: [],
      devicePlatforms: [],
      competitionLevels: [],
      trendTypes: []
    };
    setLocalFilters(resetFilters);
  };

  return (
    <div className="advanced-filters-overlay">
      <div className="advanced-filters-modal">
        <div className="filters-header">
          <h2>Filtros Avançados - Product Research</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="filters-content">
          {/* Date Range Section */}
          <div className="filter-section">
            <div className="section-header">
              <Calendar size={20} />
              <h3>Período de Análise</h3>
            </div>
            <div className="date-inputs">
              <div className="input-group">
                <label>Data Inicial</label>
                <input
                  type="date"
                  value={localFilters.dateRange.since}
                  onChange={(e) => handleDateChange('since', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Data Final</label>
                <input
                  type="date"
                  value={localFilters.dateRange.until}
                  onChange={(e) => handleDateChange('until', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Performance Metrics Section */}
          <div className="filter-section">
            <div className="section-header">
              <TrendingUp size={20} />
              <h3>Métricas de Performance</h3>
            </div>
            
            <div className="metrics-grid">
              <div className="metric-range">
                <label>Alcance (Reach)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localFilters.minReach}
                    onChange={(e) => handleInputChange('minReach', parseInt(e.target.value))}
                  />
                  <span>até</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localFilters.maxReach}
                    onChange={(e) => handleInputChange('maxReach', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="metric-range">
                <label>Investimento (€)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localFilters.minSpend}
                    onChange={(e) => handleInputChange('minSpend', parseFloat(e.target.value))}
                  />
                  <span>até</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localFilters.maxSpend}
                    onChange={(e) => handleInputChange('maxSpend', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="metric-range">
                <label>CTR (%)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Min"
                    value={localFilters.minCTR}
                    onChange={(e) => handleInputChange('minCTR', parseFloat(e.target.value))}
                  />
                  <span>até</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Max"
                    value={localFilters.maxCTR}
                    onChange={(e) => handleInputChange('maxCTR', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="metric-range">
                <label>CPC (€)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Min"
                    value={localFilters.minCPC}
                    onChange={(e) => handleInputChange('minCPC', parseFloat(e.target.value))}
                  />
                  <span>até</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Max"
                    value={localFilters.maxCPC}
                    onChange={(e) => handleInputChange('maxCPC', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="metric-range">
                <label>Frequência</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Min"
                    value={localFilters.minFrequency}
                    onChange={(e) => handleInputChange('minFrequency', parseFloat(e.target.value))}
                  />
                  <span>até</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Max"
                    value={localFilters.maxFrequency}
                    onChange={(e) => handleInputChange('maxFrequency', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Objectives Section */}
          <div className="filter-section">
            <div className="section-header">
              <Target size={20} />
              <h3>Objetivos da Campanha</h3>
            </div>
            <div className="checkbox-grid">
              {campaignObjectives.map(objective => (
                <label key={objective.value} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={localFilters.objectives.includes(objective.value)}
                    onChange={(e) => handleArrayChange('objectives', objective.value, e.target.checked)}
                  />
                  <span>{objective.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Demographics Section */}
          <div className="filter-section">
            <div className="section-header">
              <Users size={20} />
              <h3>Demografia</h3>
            </div>
            
            <div className="demographics-grid">
              <div className="age-range">
                <label>Faixa Etária</label>
                <div className="age-inputs">
                  <input
                    type="number"
                    min="13"
                    max="65"
                    value={localFilters.ageMin}
                    onChange={(e) => handleInputChange('ageMin', parseInt(e.target.value))}
                  />
                  <span>até</span>
                  <input
                    type="number"
                    min="13"
                    max="65"
                    value={localFilters.ageMax}
                    onChange={(e) => handleInputChange('ageMax', parseInt(e.target.value))}
                  />
                  <span>anos</span>
                </div>
              </div>

              <div className="gender-selection">
                <label>Gênero</label>
                <div className="gender-options">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={localFilters.genders.includes(1)}
                      onChange={(e) => handleArrayChange('genders', 1, e.target.checked)}
                    />
                    <span>Feminino</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={localFilters.genders.includes(2)}
                      onChange={(e) => handleArrayChange('genders', 2, e.target.checked)}
                    />
                    <span>Masculino</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Geographic Section */}
          <div className="filter-section">
            <div className="section-header">
              <MapPin size={20} />
              <h3>Localização Geográfica</h3>
            </div>
            <div className="checkbox-grid">
              {countryOptions.map(country => (
                <label key={country.value} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={localFilters.countries.includes(country.value)}
                    onChange={(e) => handleArrayChange('countries', country.value, e.target.checked)}
                  />
                  <span>{country.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Placements Section */}
          <div className="filter-section">
            <div className="section-header">
              <Sliders size={20} />
              <h3>Posicionamentos</h3>
            </div>
            <div className="checkbox-grid">
              {placementOptions.map(placement => (
                <label key={placement.value} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={localFilters.placements.includes(placement.value)}
                    onChange={(e) => handleArrayChange('placements', placement.value, e.target.checked)}
                  />
                  <span>{placement.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Device Platforms Section */}
          <div className="filter-section">
            <div className="section-header">
              <Smartphone size={20} />
              <h3>Dispositivos</h3>
            </div>
            <div className="checkbox-grid">
              {devicePlatformOptions.map(device => (
                <label key={device.value} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={localFilters.devicePlatforms.includes(device.value)}
                    onChange={(e) => handleArrayChange('devicePlatforms', device.value, e.target.checked)}
                  />
                  <span>{device.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="filters-footer">
          <button className="reset-btn" onClick={handleResetFilters}>
            Resetar Filtros
          </button>
          <div className="action-buttons">
            <button className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button className="apply-btn" onClick={handleApplyFilters}>
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;