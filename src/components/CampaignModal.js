import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CampaignModal = ({ campaign, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    productName: '',
    productPrice: '',
    cogs: '',
    marketType: 'low',
    initialBudget: '',
    currentBudget: '',
    market: '',
    days: []
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        ...campaign,
        productPrice: campaign.productPrice?.toString() || '',
        cogs: campaign.cogs?.toString() || '',
        initialBudget: campaign.initialBudget?.toString() || '',
        currentBudget: campaign.currentBudget?.toString() || campaign.initialBudget?.toString() || ''
      });
    }
  }, [campaign]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validações
    if (!formData.name.trim()) {
      alert('Por favor, insira o nome da campanha');
      return;
    }
    
    if (!formData.productName.trim()) {
      alert('Por favor, insira o nome do produto');
      return;
    }
    
    if (!formData.productPrice || parseFloat(formData.productPrice) <= 0) {
      alert('Por favor, insira um preço válido para o produto');
      return;
    }
    
    if (!formData.cogs || parseFloat(formData.cogs) < 0) {
      alert('Por favor, insira um COGS válido');
      return;
    }
    
    if (!formData.initialBudget || parseFloat(formData.initialBudget) <= 0) {
      alert('Por favor, insira um orçamento inicial válido');
      return;
    }
    
    if (!formData.market.trim()) {
      alert('Por favor, insira o mercado (país)');
      return;
    }

    // Converter strings para números
    const campaignData = {
      ...formData,
      productPrice: parseFloat(formData.productPrice),
      cogs: parseFloat(formData.cogs),
      initialBudget: parseFloat(formData.initialBudget),
      currentBudget: parseFloat(formData.currentBudget || formData.initialBudget),
      days: campaign ? campaign.days : []
    };

    onSave(campaignData);
  };

  const marketExamples = {
    low: 'Espanha, Itália, França, Portugal, Grécia',
    high: 'Reino Unido, Alemanha, Suíça, Dinamarca, Noruega'
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {campaign ? 'Editar Campanha' : 'Nova Campanha'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Campanha *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="Ex: Produto X - ES - Janeiro"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mercado (País) *
              </label>
              <input
                type="text"
                name="market"
                value={formData.market}
                onChange={handleChange}
                className="input"
                placeholder="Ex: Espanha, Reino Unido"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className="input"
                placeholder="Ex: Suplemento Vitamina D"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço do Produto (€) *
              </label>
              <input
                type="number"
                name="productPrice"
                value={formData.productPrice}
                onChange={handleChange}
                className="input"
                placeholder="Ex: 29.99"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                COGS - Custo do Produto (€) *
              </label>
              <input
                type="number"
                name="cogs"
                value={formData.cogs}
                onChange={handleChange}
                className="input"
                placeholder="Ex: 15.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Mercado *
              </label>
              <select
                name="marketType"
                value={formData.marketType}
                onChange={handleChange}
                className="select"
                required
              >
                <option value="low">CPC Baixo (&lt; 0.7€)</option>
                <option value="high">CPC Alto (&gt; 0.7€)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                <strong>Exemplos:</strong> {marketExamples[formData.marketType]}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orçamento Inicial (€) *
              </label>
              <input
                type="number"
                name="initialBudget"
                value={formData.initialBudget}
                onChange={handleChange}
                className="input"
                placeholder="Ex: 50"
                step="1"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orçamento Atual (€)
              </label>
              <input
                type="number"
                name="currentBudget"
                value={formData.currentBudget}
                onChange={handleChange}
                className="input"
                placeholder="Deixe vazio para usar o inicial"
                step="1"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Se vazio, será usado o orçamento inicial
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Regras Automáticas Aplicadas:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              {formData.marketType === 'low' ? (
                <>
                  <p>• <strong>Dia 1:</strong> Kill se 10€ gasto + CPC &gt; 1€ + 0 vendas + 0 ATC</p>
                  <p>• <strong>Dia 1:</strong> Kill se 20€ gasto + 0 vendas + &lt;2 ATC</p>
                  <p>• <strong>Dia 1:</strong> Kill se 25€ gasto + 0 vendas</p>
                  <p>• <strong>Dia 2:</strong> Kill se 10€ gasto + 0 vendas + &lt;2 ATC</p>
                  <p>• <strong>Dia 2:</strong> Kill se 25€ gasto + 0 vendas</p>
                </>
              ) : (
                <>
                  <p>• <strong>Dia 1:</strong> Kill se 10€ gasto + CPC &gt; 1€ + 0 vendas + 0 ATC</p>
                  <p>• <strong>Dia 1:</strong> Kill se 20€ gasto + 0 vendas + &lt;2 ATC</p>
                  <p>• <strong>Dia 1:</strong> Kill se 30€ gasto + 0 vendas</p>
                  <p>• <strong>Dia 2:</strong> Kill se 15€ gasto + 0 vendas + &lt;2 ATC</p>
                  <p>• <strong>Dia 2:</strong> Kill se 25€ gasto + 0 vendas</p>
                </>
              )}
              <p>• <strong>Scaling:</strong> Baseado na média de profit margin em 48h</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
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
              {campaign ? 'Atualizar' : 'Criar'} Campanha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignModal;