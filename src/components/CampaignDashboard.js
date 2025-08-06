import React, { useState, useEffect } from 'react';
import CampaignModal from './CampaignModal';
import CampaignTable from './CampaignTable';
import MetaConnector from './MetaConnector';
import userService from '../services/userService';
import { Plus, TrendingUp, AlertTriangle, DollarSign, Link } from 'lucide-react';
import { calculateDecision, calculateMetrics } from '../utils/campaignLogic';

const CampaignDashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [selectedMarketType, setSelectedMarketType] = useState('all');
  const [showMetaConnector, setShowMetaConnector] = useState(false);

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
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
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
    if (window.confirm('Tem certeza que deseja excluir esta campanha?')) {
      setCampaigns(prev => prev.filter(camp => camp.id !== campaignId));
    }
  };

  const handleAddDay = (campaignId, dayData) => {
    setCampaigns(prev => prev.map(camp => {
      if (camp.id === campaignId) {
        const updatedDays = [...camp.days, dayData];
        const metrics = calculateMetrics(updatedDays, camp.productPrice, camp.cogs);
        const decision = calculateDecision(camp, updatedDays, metrics);
        
        return {
          ...camp,
          days: updatedDays,
          metrics,
          decision
        };
      }
      return camp;
    }));
  };

  const handleMetaConnectionSuccess = (connectionData) => {
    console.log('Meta conectado com sucesso:', connectionData);
    setShowMetaConnector(false);
    
    // Recarregar campanhas específicas do usuário (foram salvas pelo MetaConnector)
    const userCampaigns = userService.getUserData('campaigns') || [];
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
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (selectedMarketType === 'all') return true;
    return campaign.marketType === selectedMarketType;
  });

  const totalStats = campaigns.reduce((acc, campaign) => {
    const totalSpend = campaign.days?.reduce((sum, day) => sum + day.spend, 0) || 0;
    const totalSales = campaign.days?.reduce((sum, day) => sum + day.sales, 0) || 0;
    const totalRevenue = totalSales * campaign.productPrice;
    
    return {
      totalSpend: acc.totalSpend + totalSpend,
      totalSales: acc.totalSales + totalSales,
      totalRevenue: acc.totalRevenue + totalRevenue,
      activeCampaigns: campaign.decision?.action !== 'KILL' ? acc.activeCampaigns + 1 : acc.activeCampaigns
    };
  }, { totalSpend: 0, totalSales: 0, totalRevenue: 0, activeCampaigns: 0 });

  const overallProfitMargin = totalStats.totalRevenue > 0 
    ? ((totalStats.totalRevenue - totalStats.totalSpend) / totalStats.totalRevenue * 100).toFixed(2)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <TrendingUp className="mr-3 text-blue-600" size={32} />
                Campaign Manager Pro
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <p className="text-gray-600">
                  Gestão inteligente com decisões automáticas baseadas em performance
                </p>
                {userService.isLoggedIn() && (
                  <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 text-sm font-medium">
                      {userService.getCurrentUser()?.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowMetaConnector(true)}
                className="btn btn-primary text-lg px-6 py-3"
              >
                <Link size={24} />
                Conectar Meta
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-secondary"
              >
                <Plus size={20} />
                Nova Campanha Manual
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-semibold">Total Gasto</p>
                  <p className="text-2xl font-bold text-blue-800">
                    €{totalStats.totalSpend.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="text-blue-600" size={24} />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-semibold">Total Vendas</p>
                  <p className="text-2xl font-bold text-green-800">
                    {totalStats.totalSales}
                  </p>
                </div>
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-semibold">Receita Total</p>
                  <p className="text-2xl font-bold text-purple-800">
                    €{totalStats.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-semibold">Profit Margin</p>
                  <p className="text-2xl font-bold text-yellow-800">
                    {overallProfitMargin}%
                  </p>
                </div>
                <AlertTriangle className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">
              Filtrar por tipo de mercado:
            </label>
            <select
              value={selectedMarketType}
              onChange={(e) => setSelectedMarketType(e.target.value)}
              className="select"
            >
              <option value="all">Todos os mercados</option>
              <option value="low">Mercado Baixo CPC (&lt;0.7€)</option>
              <option value="high">Mercado Alto CPC (&gt;0.7€)</option>
            </select>
          </div>
        </div>

        {/* Campaign Table */}
        <CampaignTable
          campaigns={filteredCampaigns}
          onEdit={handleEditCampaign}
          onDelete={handleDeleteCampaign}
          onAddDay={handleAddDay}
        />

        {/* Meta Connector Modal */}
        {showMetaConnector && (
          <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: '1000px' }}>
              <MetaConnector
                onConnectionSuccess={handleMetaConnectionSuccess}
              />
              <div className="flex justify-end pt-4 mt-4 border-t">
                <button
                  onClick={() => setShowMetaConnector(false)}
                  className="btn btn-secondary"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
};

export default CampaignDashboard;