import React, { useState } from 'react';
import { DollarSign, TrendingUp, BarChart3, Calculator, FileText, Download } from 'lucide-react';
import './ProfitSheet.css';
import '../styles/GlobalDesignSystem.css';

const ProfitSheet = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

  const profitData = {
    thisMonth: {
      revenue: 45680.50,
      costs: 23450.75,
      profit: 22229.75,
      margin: 48.7
    },
    lastMonth: {
      revenue: 39240.30,
      costs: 21890.15,
      profit: 17350.15,
      margin: 44.2
    },
    thisYear: {
      revenue: 567890.25,
      costs: 312456.80,
      profit: 255433.45,
      margin: 45.0
    }
  };

  const currentData = profitData[selectedPeriod];

  const productBreakdown = [
    { name: 'Produto A', revenue: 15230, cost: 8120, profit: 7110, units: 245 },
    { name: 'Produto B', revenue: 12450, cost: 6890, profit: 5560, units: 189 },
    { name: 'Produto C', revenue: 9870, cost: 5340, profit: 4530, units: 156 },
    { name: 'Produto D', revenue: 8130, cost: 3100, profit: 5030, units: 98 }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  return (
    <div className="profit-sheet-container">
      <div className="profit-header">
        <div className="page-title">
          <DollarSign size={32} className="title-icon" />
          <h1>Profit Sheet</h1>
        </div>
        <div className="header-actions">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-selector"
          >
            <option value="thisMonth">Este Mês</option>
            <option value="lastMonth">Mês Anterior</option>
            <option value="thisYear">Este Ano</option>
          </select>
          <button className="export-btn">
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      <div className="profit-metrics">
        <div className="metric-card revenue">
          <div className="metric-header">
            <TrendingUp size={24} />
            <h3>Receita Total</h3>
          </div>
          <div className="metric-value">{formatCurrency(currentData.revenue)}</div>
          <div className="metric-change positive">+12.5% vs período anterior</div>
        </div>

        <div className="metric-card costs">
          <div className="metric-header">
            <BarChart3 size={24} />
            <h3>Custos Totais</h3>
          </div>
          <div className="metric-value">{formatCurrency(currentData.costs)}</div>
          <div className="metric-change negative">+8.3% vs período anterior</div>
        </div>

        <div className="metric-card profit">
          <div className="metric-header">
            <Calculator size={24} />
            <h3>Lucro Líquido</h3>
          </div>
          <div className="metric-value">{formatCurrency(currentData.profit)}</div>
          <div className="metric-change positive">+18.7% vs período anterior</div>
        </div>

        <div className="metric-card margin">
          <div className="metric-header">
            <FileText size={24} />
            <h3>Margem de Lucro</h3>
          </div>
          <div className="metric-value">{currentData.margin}%</div>
          <div className="metric-change positive">+2.1% vs período anterior</div>
        </div>
      </div>

      <div className="profit-breakdown">
        <h2>Breakdown por Produto</h2>
        <div className="breakdown-table">
          <div className="table-header">
            <div>Produto</div>
            <div>Receita</div>
            <div>Custo</div>
            <div>Lucro</div>
            <div>Unidades</div>
            <div>Margem</div>
          </div>
          {productBreakdown.map((product, index) => (
            <div key={index} className="table-row">
              <div className="product-name" data-label="Produto">{product.name}</div>
              <div className="revenue" data-label="Receita">{formatCurrency(product.revenue)}</div>
              <div className="cost" data-label="Custo">{formatCurrency(product.cost)}</div>
              <div className="profit" data-label="Lucro">{formatCurrency(product.profit)}</div>
              <div className="units" data-label="Unidades">{product.units}</div>
              <div className="margin" data-label="Margem">{((product.profit / product.revenue) * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="insights-section">
        <h2>Insights e Recomendações</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>🎯 Melhor Performer</h4>
            <p>Produto A tem a maior margem de lucro (46.7%) e deve ser priorizado nas campanhas.</p>
          </div>
          <div className="insight-card">
            <h4>⚠️ Atenção Necessária</h4>
            <p>Produto D tem custos crescentes - revisar fornecedores pode melhorar a margem.</p>
          </div>
          <div className="insight-card">
            <h4>📈 Oportunidade</h4>
            <p>Lucro total cresceu 18.7% - considere expandir linha de produtos similares.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitSheet;