import React, { useState } from 'react';
import DayModal from './DayModal';
import { Edit, Trash2, Plus, TrendingUp, TrendingDown, X, AlertTriangle } from 'lucide-react';

const CampaignTable = ({ campaigns, onEdit, onDelete, onAddDay }) => {
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [expandedCampaigns, setExpandedCampaigns] = useState(new Set());

  const handleAddDay = (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    setSelectedCampaign(campaign);
    setShowDayModal(true);
  };

  const handleSaveDay = (dayData) => {
    if (selectedCampaign) {
      onAddDay(selectedCampaign.id, dayData);
    }
    setShowDayModal(false);
    setSelectedCampaign(null);
  };

  const toggleExpanded = (campaignId) => {
    const newExpanded = new Set(expandedCampaigns);
    if (newExpanded.has(campaignId)) {
      newExpanded.delete(campaignId);
    } else {
      newExpanded.add(campaignId);
    }
    setExpandedCampaigns(newExpanded);
  };

  const getDecisionBadge = (decision) => {
    if (!decision) return null;

    const badgeClasses = {
      'KILL': 'badge badge-danger',
      'SCALE': 'badge badge-success',
      'MAINTAIN': 'badge badge-info',
      'DESCALE': 'badge badge-warning'
    };

    const icons = {
      'KILL': <X size={12} />,
      'SCALE': <TrendingUp size={12} />,
      'MAINTAIN': <AlertTriangle size={12} />,
      'DESCALE': <TrendingDown size={12} />
    };

    return (
      <span className={badgeClasses[decision.action] || 'badge badge-info'}>
        {icons[decision.action]}
        {decision.action}
      </span>
    );
  };

  const getMarketTypeBadge = (marketType) => {
    return (
      <span className={`badge ${marketType === 'low' ? 'badge-success' : 'badge-warning'}`}>
        {marketType === 'low' ? 'CPC Baixo' : 'CPC Alto'}
      </span>
    );
  };

  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Nenhuma campanha encontrada
        </h3>
        <p className="text-gray-600 mb-4">
          Comece criando sua primeira campanha para começar a acompanhar a performance.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Campanha</th>
                <th>Produto</th>
                <th>Mercado</th>
                <th>Orçamento Atual</th>
                <th>Dias Testados</th>
                <th>Total Gasto</th>
                <th>Total Vendas</th>
                <th>Profit Margin</th>
                <th>Decisão</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const isExpanded = expandedCampaigns.has(campaign.id);
                const totalSpend = campaign.days?.reduce((sum, day) => sum + day.spend, 0) || 0;
                const totalSales = campaign.days?.reduce((sum, day) => sum + day.sales, 0) || 0;
                const totalRevenue = totalSales * campaign.productPrice;
                const overallProfitMargin = totalRevenue > 0 
                  ? ((totalRevenue - totalSpend - (totalSales * campaign.cogs)) / totalRevenue * 100)
                  : 0;

                return (
                  <React.Fragment key={campaign.id}>
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpanded(campaign.id)}>
                      <td>
                        <div>
                          <div className="font-semibold text-gray-800">{campaign.name}</div>
                          <div className="text-sm text-gray-500">
                            Criada em {new Date(campaign.createdAt).toLocaleDateString('pt-PT')}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="font-medium">{campaign.productName}</div>
                          <div className="text-sm text-gray-500">€{campaign.productPrice}</div>
                        </div>
                      </td>
                      <td>{getMarketTypeBadge(campaign.marketType)}</td>
                      <td>€{campaign.currentBudget || campaign.initialBudget}</td>
                      <td>
                        <span className="text-center px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {campaign.days?.length || 0}
                        </span>
                      </td>
                      <td>€{totalSpend.toFixed(2)}</td>
                      <td>{totalSales}</td>
                      <td>
                        <span className={`font-semibold ${overallProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {overallProfitMargin.toFixed(2)}%
                        </span>
                      </td>
                      <td>{getDecisionBadge(campaign.decision)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAddDay(campaign.id)}
                            className="btn btn-primary"
                            title="Adicionar Dia"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            onClick={() => onEdit(campaign)}
                            className="btn btn-secondary"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => onDelete(campaign.id)}
                            className="btn btn-danger"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded row showing daily data */}
                    {isExpanded && campaign.days && campaign.days.length > 0 && (
                      <tr>
                        <td colSpan="10" className="bg-gray-50 p-0">
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-800 mb-3">Dados Diários</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left p-2">Dia</th>
                                    <th className="text-left p-2">Gasto</th>
                                    <th className="text-left p-2">Vendas</th>
                                    <th className="text-left p-2">ATC</th>
                                    <th className="text-left p-2">CPC</th>
                                    <th className="text-left p-2">CPA</th>
                                    <th className="text-left p-2">ROAS</th>
                                    <th className="text-left p-2">BER</th>
                                    <th className="text-left p-2">Profit Margin</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {campaign.days.map((day, index) => {
                                    const revenue = day.sales * campaign.productPrice;
                                    const cogs = day.sales * campaign.cogs;
                                    const profit = revenue - day.spend - cogs;
                                    const profitMargin = revenue > 0 ? (profit / revenue * 100) : 0;
                                    const roas = day.spend > 0 ? (revenue / day.spend) : 0;
                                    const ber = day.spend > 0 ? (day.spend / revenue * 100) : 0;
                                    const cpc = day.clicks > 0 ? (day.spend / day.clicks) : 0;
                                    const cpa = day.sales > 0 ? (day.spend / day.sales) : 0;

                                    return (
                                      <tr key={index} className="border-b">
                                        <td className="p-2 font-medium">Dia {index + 1}</td>
                                        <td className="p-2">€{day.spend.toFixed(2)}</td>
                                        <td className="p-2">{day.sales}</td>
                                        <td className="p-2">{day.atc}</td>
                                        <td className="p-2">€{cpc.toFixed(2)}</td>
                                        <td className="p-2">€{cpa.toFixed(2)}</td>
                                        <td className="p-2">{roas.toFixed(2)}x</td>
                                        <td className="p-2">{ber.toFixed(2)}%</td>
                                        <td className="p-2">
                                          <span className={`font-semibold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {profitMargin.toFixed(2)}%
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                            
                            {/* Decision explanation */}
                            {campaign.decision && (
                              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <h5 className="font-semibold text-blue-800 mb-2">Análise Automática:</h5>
                                <p className="text-blue-700 text-sm">{campaign.decision.reason}</p>
                                {campaign.decision.newBudget && (
                                  <p className="text-blue-700 text-sm mt-1">
                                    <strong>Novo orçamento sugerido:</strong> €{campaign.decision.newBudget}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Day Modal */}
      {showDayModal && (
        <DayModal
          campaign={selectedCampaign}
          onSave={handleSaveDay}
          onClose={() => {
            setShowDayModal(false);
            setSelectedCampaign(null);
          }}
        />
      )}
    </>
  );
};

export default CampaignTable;