import React, { useState, useEffect } from 'react';
import CampaignModal from './CampaignModal';
import CampaignTable from './CampaignTable';
import MetaConnector from './MetaConnector';
import CustomDropdown from './CustomDropdown';
import userService from '../services/userService';
import { Plus, TrendingUp, AlertTriangle, DollarSign, Link, Target, Users } from 'lucide-react';
import { calculateDecision, calculateMetrics } from '../utils/campaignLogic';
import './CampaignDashboard.css';

const CampaignDashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [selectedMarketType, setSelectedMarketType] = useState('all');
  const [showMetaConnector, setShowMetaConnector] = useState(false);

  // Opções do dropdown de filtro de mercado
  const marketTypeOptions = [
    { value: 'all', label: 'Todos os mercados' },
    { value: 'low', label: 'Mercado Baixo CPC (<0.7€)' },
    { value: 'high', label: 'Mercado Alto CPC (>0.7€)' }
  ];

  // Carregar campanhas específicas do usuário
  useEffect(() => {
    if (userService.isLoggedIn()) {
      const userCampaigns = userService.getUserData('campaigns') || [];
      // Calcular métricas e decisões para cada campanha
      const campaignsWithDecisions = userCampaigns.map(campaign => {
        if (campaign.days && campaign.days.length > 0) {
          const metrics = calculateMetrics(campaign.days, campaign.productPrice, campaign.cogs);
          const decision = calculateDecision(campaign, campaign.days, metrics);
          return {
            ...campaign,
            metrics,
            decision
          };
        }
        return campaign;
      });
      setCampaigns(campaignsWithDecisions);
    }
  }, []);

  // Salvar campanhas específicas do usuário
  useEffect(() => {
    if (userService.isLoggedIn() && campaigns.length > 0) {
      userService.saveUserData('campaigns', campaigns);
    }
  }, [campaigns]);

  const handleSaveCampaign = (campaignData) => {
    if (editingCampaign) {
      // Editar campanha existente
      setCampaigns(prev => prev.map(camp => 
        camp.id === editingCampaign.id 
          ? { ...campaignData, id: editingCampaign.id }
          : camp
      ));
    } else {
      // Nova campanha
      const newCampaign = {
        ...campaignData,
        id: Date.now(),
        days: []
      };
      setCampaigns(prev => [...prev, newCampaign]);
    }
    setShowModal(false);
    setEditingCampaign(null);
  };

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setShowModal(true);
  };

  const handleDeleteCampaign = (campaignId) => {
    setCampaigns(prev => prev.filter(camp => camp.id !== campaignId));
  };

  const handleAddDay = (campaignId, dayData) => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId) {
        const updatedCampaign = {
          ...campaign,
          days: [...(campaign.days || []), dayData]
        };
        
        // Recalcular métricas e decisão
        const metrics = calculateMetrics(updatedCampaign.days, campaign.productPrice, campaign.cogs);
        const decision = calculateDecision(updatedCampaign, updatedCampaign.days, metrics);
        
        return {
          ...updatedCampaign,
          metrics,
          decision
        };
      }
      return campaign;
    }));
  };

  const handleMetaConnectionSuccess = (importedCampaigns) => {
    const campaignsWithDecisions = importedCampaigns.map(campaign => {
      if (campaign.days && campaign.days.length > 0) {
        const metrics = calculateMetrics(campaign.days, campaign.productPrice, campaign.cogs);
        const decision = calculateDecision(campaign, campaign.days, metrics);
        return {
          ...campaign,
          metrics,
          decision
        };
      }
      return campaign;
    });
    setCampaigns(prev => [...prev, ...campaignsWithDecisions]);
    setShowMetaConnector(false);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (selectedMarketType === 'all') return true;
    return campaign.marketType === selectedMarketType;
  });

  // Calcular métricas gerais
  const totalMetrics = campaigns.reduce((acc, campaign) => {
    const totalSpent = campaign.days?.reduce((sum, day) => sum + day.spend, 0) || 0;
    const totalSales = campaign.days?.reduce((sum, day) => sum + day.sales, 0) || 0;
    const totalRevenue = totalSales * (campaign.productPrice || 0);
    
    return {
      totalSpent: acc.totalSpent + totalSpent,
      totalSales: acc.totalSales + totalSales,
      totalRevenue: acc.totalRevenue + totalRevenue
    };
  }, { totalSpent: 0, totalSales: 0, totalRevenue: 0 });

  const averageROAS = totalMetrics.totalSpent > 0 ? totalMetrics.totalRevenue / totalMetrics.totalSpent : 0;
  const activeCampaigns = campaigns.filter(c => c.decision?.action !== 'KILL').length;

  return (
    <div className="campaign-dashboard">
      {/* Header */}
      <div className="campaign-header">
        <div className="header-content">
          <div>
            <h1 className="campaign-title">
              Campaign Dashboard
            </h1>
            <p className="campaign-subtitle">
              Gerir e otimizar campanhas Facebook Ads
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="campaign-actions">
            <button
              onClick={() => setShowModal(true)}
              className="campaign-btn primary"
            >
              <Plus size={16} />
              Nova Campanha
            </button>

            <button
              onClick={() => setShowMetaConnector(!showMetaConnector)}
              className="campaign-btn"
            >
              <Link size={16} />
              {showMetaConnector ? 'Ocultar' : 'Conectar'} Meta
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {campaigns.length > 0 && (
        <div className="campaign-stats">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">
                <DollarSign size={24} />
              </div>
              <div className="stat-change">
                Total
              </div>
            </div>
            <h3 className="stat-value">
              {totalMetrics.totalSpent.toFixed(2)}€
            </h3>
            <p className="stat-title">
              Investimento Total
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-change" style={{
                background: averageROAS >= 3 ? 'rgba(150, 242, 215, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: averageROAS >= 3 ? '#96f2d7' : '#f59e0b'
              }}>
                {averageROAS >= 3 ? 'Bom' : 'Médio'}
              </div>
            </div>
            <h3 className="stat-value">
              {averageROAS.toFixed(1)}x
            </h3>
            <p className="stat-title">
              ROAS Médio
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">
                <Target size={24} />
              </div>
              <div className="stat-change" style={{
                background: activeCampaigns > 0 ? 'rgba(150, 242, 215, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: activeCampaigns > 0 ? '#96f2d7' : '#ef4444'
              }}>
                {activeCampaigns > 0 ? 'Ativas' : 'Pausadas'}
              </div>
            </div>
            <h3 className="stat-value">
              {campaigns.length}
            </h3>
            <p className="stat-title">
              Campanhas Totais
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-change">
                Vendas
              </div>
            </div>
            <h3 className="stat-value">
              {totalMetrics.totalSales}
            </h3>
            <p className="stat-title">
              Conversões Totais
            </p>
          </div>
        </div>
      )}

      {/* Market Type Filter */}
      <div className="campaign-filters">
        <CustomDropdown
          options={marketTypeOptions}
          value={selectedMarketType}
          onChange={setSelectedMarketType}
          className="filter-style"
          placeholder="Selecionar tipo de mercado..."
        />
      </div>

      {/* Meta Connector */}
      {showMetaConnector && (
        <div className="meta-connector-section">
          <MetaConnector
            onConnectionSuccess={handleMetaConnectionSuccess}
          />
        </div>
      )}

      {/* Campaigns Table */}
      <div className="campaign-table-section">
        <div className="section-header">
          <h2 className="section-title">
            Campanhas Ativas
          </h2>
        </div>
        
        <CampaignTable
          campaigns={filteredCampaigns}
          onEdit={handleEditCampaign}
          onDelete={handleDeleteCampaign}
          onAddDay={handleAddDay}
        />
      </div>

      {/* Campaign Modal */}
      {showModal && (
        <CampaignModal
          campaign={editingCampaign}
          onSave={handleSaveCampaign}
          onClose={() => {
            setShowModal(false);
            setEditingCampaign(null);
          }}
        />
      )}
    </div>
  );
};

export default CampaignDashboard;