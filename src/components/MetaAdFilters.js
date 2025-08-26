/**
 * Meta Ad Research Advanced Filters
 * Implementa TODOS os filtros obrigatórios da especificação
 * Mantém o design system da plataforma
 */

import React, { useState } from 'react';
import { 
  Calendar, Clock, Target, Globe, PlayCircle, 
  Image, Layers, Smartphone, Languages, X 
} from 'lucide-react';
import { META_CONSTANTS } from '../services/metaAdLibraryApi';
import './MetaAdFilters.css';

const MetaAdFilters = ({ filters, onFiltersChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState({ ...filters });

  // Listas de opções
  const mediaTypes = [
    { value: '', label: 'Todos os tipos', icon: null },
    { value: META_CONSTANTS.MEDIA_TYPES.IMAGE, label: 'Imagem/Foto', icon: Image },
    { value: META_CONSTANTS.MEDIA_TYPES.VIDEO, label: 'Vídeo', icon: PlayCircle },
    { value: META_CONSTANTS.MEDIA_TYPES.CAROUSEL, label: 'Carousel', icon: Layers }
  ];

  const activeStatusOptions = [
    { value: 'ALL', label: 'Todos os Estados' },
    { value: 'ACTIVE', label: 'Ativos' },
    { value: 'INACTIVE', label: 'Inativos' }
  ];

  const publisherPlatforms = [
    { value: 'FACEBOOK', label: 'Facebook', color: '#1877f2' },
    { value: 'INSTAGRAM', label: 'Instagram', color: '#e4405f' },
    { value: 'MESSENGER', label: 'Messenger', color: '#00b2ff' },
    { value: 'WHATSAPP', label: 'WhatsApp', color: '#25d366' }
  ];

  const commonLanguages = [
    { code: 'pt', name: 'Português' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'nl', name: 'Nederlands' }
  ];

  // Manipulação de arrays
  const handleArrayChange = (field, value, checked) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  // Aplicar filtros
  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  // Reset filtros
  const handleReset = () => {
    const resetFilters = {
      country: ['PT'],
      q: '',
      page_id: '',
      ad_active_status: 'ALL',
      date_min: '',
      date_max: '',
      days_active_min: '',
      days_active_max: '',
      reach_min: '',
      reach_max: '',
      media_type: '',
      publisher_platforms: [],
      languages: [],
      limit: 50,
      after: null
    };
    setLocalFilters(resetFilters);
  };

  return (
    <div className="meta-filters-overlay">
      <div className="meta-filters-modal">
        {/* Header */}
        <div className="filters-header">
          <h2>Filtros Avançados - Meta Ad Research</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="filters-content">
          {/* Seção: Datas e Tempo */}
          <div className="filter-section">
            <div className="section-header">
              <Calendar size={20} />
              <h3>Período de Entrega</h3>
            </div>

            <div className="date-range-inputs">
              <div className="input-group">
                <label>Data Início</label>
                <input
                  type="date"
                  value={localFilters.date_min}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, date_min: e.target.value }))}
                />
                <small>ad_delivery_date_min</small>
              </div>

              <div className="input-group">
                <label>Data Fim</label>
                <input
                  type="date"
                  value={localFilters.date_max}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, date_max: e.target.value }))}
                />
                <small>ad_delivery_date_max</small>
              </div>
            </div>
          </div>

          {/* Seção: Dias Ativos (OBRIGATÓRIO) */}
          <div className="filter-section">
            <div className="section-header">
              <Clock size={20} />
              <h3>Dias de Anúncios Ativos</h3>
              <span className="required-badge">Obrigatório</span>
            </div>

            <div className="range-inputs">
              <div className="input-group">
                <label>Mínimo de Dias</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 7"
                  value={localFilters.days_active_min}
                  onChange={(e) => setLocalFilters(prev => ({ 
                    ...prev, 
                    days_active_min: e.target.value 
                  }))}
                />
                <small>Computado: start_time → stop_time (ou hoje)</small>
              </div>

              <div className="input-group">
                <label>Máximo de Dias</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 90"
                  value={localFilters.days_active_max}
                  onChange={(e) => setLocalFilters(prev => ({ 
                    ...prev, 
                    days_active_max: e.target.value 
                  }))}
                />
                <small>Filtro pós-processamento no backend</small>
              </div>
            </div>
          </div>

          {/* Seção: Reach/Impressões (OBRIGATÓRIO) */}
          <div className="filter-section">
            <div className="section-header">
              <Target size={20} />
              <h3>Alcance e Impressões</h3>
              <span className="required-badge">Obrigatório</span>
            </div>

            <div className="reach-info-banner">
              <div className="reach-info">
                <strong>UE/Reino Unido:</strong> eu_total_reach disponível
              </div>
              <div className="reach-info">
                <strong>Outros países:</strong> impressions range (político/social)
              </div>
            </div>

            <div className="range-inputs">
              <div className="input-group">
                <label>Reach/Impressões Mínimo</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 1000"
                  value={localFilters.reach_min}
                  onChange={(e) => setLocalFilters(prev => ({ 
                    ...prev, 
                    reach_min: e.target.value 
                  }))}
                />
                <small>Suporta EU reach + impressions range</small>
              </div>

              <div className="input-group">
                <label>Reach/Impressões Máximo</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 100000"
                  value={localFilters.reach_max}
                  onChange={(e) => setLocalFilters(prev => ({ 
                    ...prev, 
                    reach_max: e.target.value 
                  }))}
                />
                <small>Pós-filtro numérico no backend</small>
              </div>
            </div>
          </div>

          {/* Seção: Formato Criativo (OBRIGATÓRIO) */}
          <div className="filter-section">
            <div className="section-header">
              <Image size={20} />
              <h3>Formato Criativo</h3>
              <span className="required-badge">Obrigatório</span>
            </div>

            <div className="media-type-selector">
              {mediaTypes.map(type => (
                <button
                  key={type.value}
                  className={`media-type-btn ${localFilters.media_type === type.value ? 'active' : ''}`}
                  onClick={() => setLocalFilters(prev => ({ ...prev, media_type: type.value }))}
                >
                  {type.icon && <type.icon size={16} />}
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
            <small className="field-note">
              Campo nativo media_type ou derivado via snapshot/payload
            </small>
          </div>

          {/* Seção: Estado Ativo (OBRIGATÓRIO) */}
          <div className="filter-section">
            <div className="section-header">
              <Globe size={20} />
              <h3>Estado do Anúncio</h3>
              <span className="required-badge">Obrigatório</span>
            </div>

            <div className="radio-group">
              {activeStatusOptions.map(option => (
                <label key={option.value} className="radio-item">
                  <input
                    type="radio"
                    name="ad_active_status"
                    value={option.value}
                    checked={localFilters.ad_active_status === option.value}
                    onChange={(e) => setLocalFilters(prev => ({ 
                      ...prev, 
                      ad_active_status: e.target.value 
                    }))}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <small className="field-note">ad_active_status: ALL | ACTIVE | INACTIVE</small>
          </div>

          {/* Seção: Plataformas (Opcional) */}
          <div className="filter-section">
            <div className="section-header">
              <Smartphone size={20} />
              <h3>Plataformas de Publicação</h3>
              <span className="optional-badge">Opcional</span>
            </div>

            <div className="platforms-grid">
              {publisherPlatforms.map(platform => (
                <label key={platform.value} className="platform-item">
                  <input
                    type="checkbox"
                    checked={localFilters.publisher_platforms.includes(platform.value)}
                    onChange={(e) => handleArrayChange('publisher_platforms', platform.value, e.target.checked)}
                  />
                  <div 
                    className="platform-color" 
                    style={{ backgroundColor: platform.color }}
                  />
                  <span>{platform.label}</span>
                </label>
              ))}
            </div>
            <small className="field-note">publisher_platforms: FACEBOOK, INSTAGRAM, etc.</small>
          </div>

          {/* Seção: Línguas (Opcional) */}
          <div className="filter-section">
            <div className="section-header">
              <Languages size={20} />
              <h3>Línguas de Conteúdo</h3>
              <span className="optional-badge">Opcional</span>
            </div>

            <div className="languages-grid">
              {commonLanguages.map(lang => (
                <label key={lang.code} className="language-item">
                  <input
                    type="checkbox"
                    checked={localFilters.languages.includes(lang.code)}
                    onChange={(e) => handleArrayChange('languages', lang.code, e.target.checked)}
                  />
                  <span>{lang.name}</span>
                </label>
              ))}
            </div>
            <small className="field-note">content_languages - deteta idioma do texto criativo</small>
          </div>

          {/* Seção: Pesquisa por Loja (OBRIGATÓRIO) */}
          <div className="filter-section">
            <div className="section-header">
              <Target size={20} />
              <h3>Pesquisa por Loja/Página</h3>
              <span className="required-badge">Obrigatório</span>
            </div>

            <div className="search-inputs">
              <div className="input-group">
                <label>Termos de Pesquisa</label>
                <input
                  type="text"
                  placeholder="Nome da marca, produto, empresa..."
                  value={localFilters.q}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, q: e.target.value }))}
                />
                <small>search_terms - busca textual no conteúdo</small>
              </div>

              <div className="input-group">
                <label>ID da Página</label>
                <input
                  type="text"
                  placeholder="123456789012345"
                  value={localFilters.page_id}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, page_id: e.target.value }))}
                />
                <small>search_page_ids - ID numérico específico</small>
              </div>
            </div>

            <div className="search-note">
              <strong>Nota:</strong> A Graph API pública não suporta pesquisa livre de páginas por nome.
              Use o ID da página diretamente se conhecido.
            </div>
          </div>

          {/* Seção: Configurações de Resultados */}
          <div className="filter-section">
            <div className="section-header">
              <Globe size={20} />
              <h3>Configurações de Busca</h3>
            </div>

            <div className="input-group">
              <label>Limite de Resultados por Página</label>
              <select
                value={localFilters.limit}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
              >
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
                <option value={75}>75 por página</option>
                <option value={100}>100 por página (máximo)</option>
              </select>
              <small>Máximo 100 por limitação da Graph API</small>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="filters-footer">
          <button className="reset-btn" onClick={handleReset}>
            Resetar Todos
          </button>
          
          <div className="action-buttons">
            <button className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button className="apply-btn" onClick={handleApply}>
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaAdFilters;