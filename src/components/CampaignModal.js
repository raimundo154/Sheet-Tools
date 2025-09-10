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
    
    // Validations
    if (!formData.name.trim()) {
      alert('Please enter the campaign name');
      return;
    }
    
    if (!formData.productName.trim()) {
      alert('Please enter the product name');
      return;
    }
    
    if (!formData.productPrice || parseFloat(formData.productPrice) <= 0) {
      alert('Please enter a valid product price');
      return;
    }
    
    if (!formData.cogs || parseFloat(formData.cogs) < 0) {
      alert('Please enter a valid COGS');
      return;
    }
    
    if (!formData.initialBudget || parseFloat(formData.initialBudget) <= 0) {
      alert('Please enter a valid initial budget');
      return;
    }
    
    if (!formData.market.trim()) {
      alert('Please enter the market (country)');
      return;
    }

    // Convert strings to numbers
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
    low: 'Spain, Italy, France, Portugal, Greece',
    high: 'United Kingdom, Germany, Switzerland, Denmark, Norway'
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {campaign ? 'Edit Campaign' : 'New Campaign'}
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
                Campaign Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="Ex: Product X - ES - January"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Market (Country) *
              </label>
              <input
                type="text"
                name="market"
                value={formData.market}
                onChange={handleChange}
                className="input"
                placeholder="Ex: Spain, United Kingdom"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className="input"
                placeholder="Ex: Vitamin D Supplement"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Price (€) *
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
                COGS - Product Cost (€) *
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
                Market Type *
              </label>
              <select
                name="marketType"
                value={formData.marketType}
                onChange={handleChange}
                className="select"
                required
              >
                <option value="low">Low CPC (&lt; 0.7€)</option>
                <option value="high">High CPC (&gt; 0.7€)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                <strong>Examples:</strong> {marketExamples[formData.marketType]}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Budget (€) *
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
                Current Budget (€)
              </label>
              <input
                type="number"
                name="currentBudget"
                value={formData.currentBudget}
                onChange={handleChange}
                className="input"
                placeholder="Leave empty to use initial"
                step="1"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                If empty, initial budget will be used
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Applied Automatic Rules:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              {formData.marketType === 'low' ? (
                <>
                  <p>• <strong>Day 1:</strong> Kill if 10€ spent + CPC &gt; 1€ + 0 sales + 0 ATC</p>
                  <p>• <strong>Day 1:</strong> Kill if 20€ spent + 0 sales + &lt;2 ATC</p>
                  <p>• <strong>Day 1:</strong> Kill if 25€ spent + 0 sales</p>
                  <p>• <strong>Day 2:</strong> Kill if 10€ spent + 0 sales + &lt;2 ATC</p>
                  <p>• <strong>Day 2:</strong> Kill if 25€ spent + 0 sales</p>
                </>
              ) : (
                <>
                  <p>• <strong>Day 1:</strong> Kill if 10€ spent + CPC &gt; 1€ + 0 sales + 0 ATC</p>
                  <p>• <strong>Day 1:</strong> Kill if 20€ spent + 0 sales + &lt;2 ATC</p>
                  <p>• <strong>Day 1:</strong> Kill if 30€ spent + 0 sales</p>
                  <p>• <strong>Day 2:</strong> Kill if 15€ spent + 0 sales + &lt;2 ATC</p>
                  <p>• <strong>Day 2:</strong> Kill if 25€ spent + 0 sales</p>
                </>
              )}
              <p>• <strong>Scaling:</strong> Based on average profit margin over 48h</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {campaign ? 'Update' : 'Create'} Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignModal;