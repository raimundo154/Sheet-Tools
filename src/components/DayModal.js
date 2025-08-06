import React, { useState } from 'react';
import { X, Calculator } from 'lucide-react';

const DayModal = ({ campaign, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    spend: '',
    sales: '',
    atc: '',
    clicks: '',
    impressions: '',
    unitsSold: ''
  });

  const [calculatedMetrics, setCalculatedMetrics] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);
    calculateMetrics(newFormData);
  };

  const calculateMetrics = (data) => {
    const spend = parseFloat(data.spend) || 0;
    const sales = parseInt(data.sales) || 0;
    const clicks = parseInt(data.clicks) || 0;
    const impressions = parseInt(data.impressions) || 0;
    const unitsSold = parseInt(data.unitsSold) || sales; // Default to sales if not provided

    const revenue = sales * campaign.productPrice;
    const cogs = unitsSold * campaign.cogs;
    const profit = revenue - spend - cogs;
    const profitMargin = revenue > 0 ? (profit / revenue * 100) : 0;
    
    const roas = spend > 0 ? (revenue / spend) : 0;
    const ber = spend > 0 ? (spend / revenue * 100) : 0;
    const cpc = clicks > 0 ? (spend / clicks) : 0;
    const cpa = sales > 0 ? (spend / sales) : 0;
    const ctr = impressions > 0 ? (clicks / impressions * 100) : 0;
    const conversionRate = clicks > 0 ? (sales / clicks * 100) : 0;

    setCalculatedMetrics({
      revenue,
      cogs,
      profit,
      profitMargin,
      roas,
      ber,
      cpc,
      cpa,
      ctr,
      conversionRate
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validações
    if (!formData.spend || parseFloat(formData.spend) <= 0) {
      alert('Por favor, insira um gasto válido');
      return;
    }
    
    if (!formData.sales || parseInt(formData.sales) < 0) {
      alert('Por favor, insira o número de vendas');
      return;
    }
    
    if (!formData.atc || parseInt(formData.atc) < 0) {
      alert('Por favor, insira o número de ATC (Add to Cart)');
      return;
    }
    
    if (!formData.clicks || parseInt(formData.clicks) <= 0) {
      alert('Por favor, insira o número de cliques');
      return;
    }

    // Converter strings para números
    const dayData = {
      spend: parseFloat(formData.spend),
      sales: parseInt(formData.sales),
      atc: parseInt(formData.atc),
      clicks: parseInt(formData.clicks),
      impressions: parseInt(formData.impressions) || 0,
      unitsSold: parseInt(formData.unitsSold) || parseInt(formData.sales),
      date: new Date().toISOString(),
      dayNumber: (campaign.days?.length || 0) + 1
    };

    onSave(dayData);
  };

  const currentDay = (campaign.days?.length || 0) + 1;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '800px' }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Adicionar Dia {currentDay}
            </h2>
            <p className="text-gray-600">
              Campanha: {campaign.name} | Produto: {campaign.productName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Calculator size={20} className="mr-2" />
                Dados do Dia
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gasto (€) *
                </label>
                <input
                  type="number"
                  name="spend"
                  value={formData.spend}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ex: 25.50"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendas *
                </label>
                <input
                  type="number"
                  name="sales"
                  value={formData.sales}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ex: 3"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ATC (Add to Cart) *
                </label>
                <input
                  type="number"
                  name="atc"
                  value={formData.atc}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ex: 8"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliques *
                </label>
                <input
                  type="number"
                  name="clicks"
                  value={formData.clicks}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ex: 150"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Impressões
                </label>
                <input
                  type="number"
                  name="impressions"
                  value={formData.impressions}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ex: 5000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidades Vendidas
                </label>
                <input
                  type="number"
                  name="unitsSold"
                  value={formData.unitsSold}
                  onChange={handleChange}
                  className="input"
                  placeholder="Se vazio, usa o valor de vendas"
                  min="0"
                />
              </div>
            </div>

            {/* Calculated Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Métricas Calculadas
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Receita</p>
                    <p className="text-lg font-semibold text-green-600">
                      €{calculatedMetrics.revenue?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">COGS</p>
                    <p className="text-lg font-semibold text-red-600">
                      €{calculatedMetrics.cogs?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Lucro</p>
                    <p className={`text-lg font-semibold ${(calculatedMetrics.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      €{calculatedMetrics.profit?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Profit Margin</p>
                    <p className={`text-lg font-semibold ${(calculatedMetrics.profitMargin || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {calculatedMetrics.profitMargin?.toFixed(2) || '0.00'}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">ROAS</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {calculatedMetrics.roas?.toFixed(2) || '0.00'}x
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">BER</p>
                    <p className="text-lg font-semibold text-purple-600">
                      {calculatedMetrics.ber?.toFixed(2) || '0.00'}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">CPC</p>
                    <p className="text-lg font-semibold text-orange-600">
                      €{calculatedMetrics.cpc?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CPA</p>
                    <p className="text-lg font-semibold text-yellow-600">
                      €{calculatedMetrics.cpa?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>

                {formData.impressions && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">CTR</p>
                      <p className="text-lg font-semibold text-indigo-600">
                        {calculatedMetrics.ctr?.toFixed(2) || '0.00'}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Taxa Conversão</p>
                      <p className="text-lg font-semibold text-pink-600">
                        {calculatedMetrics.conversionRate?.toFixed(2) || '0.00'}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Info about campaign */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Info da Campanha</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Preço Produto:</strong> €{campaign.productPrice}</p>
                  <p><strong>COGS:</strong> €{campaign.cogs}</p>
                  <p><strong>Mercado:</strong> {campaign.marketType === 'low' ? 'CPC Baixo' : 'CPC Alto'}</p>
                  <p><strong>Orçamento Atual:</strong> €{campaign.currentBudget || campaign.initialBudget}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 mt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Adicionar Dia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DayModal;