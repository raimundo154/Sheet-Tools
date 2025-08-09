import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Package,
  RefreshCw, 
  Calculator,
  ArrowRight,
  ArrowLeftRight,
  Clock,
  Info,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  FileText
} from 'lucide-react';
import './QuotationPage.css';

const QuotationPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [exchangeRates, setExchangeRates] = useState({});
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [lastUpdated, setLastUpdated] = useState('');
  
  // Product states
  const [products, setProducts] = useState([{
    id: 1,
    name: '',
    price: '',
    shippingTime: '',
    inStock: true,
    convertedPrice: 0
  }]);

  const currencies = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
    { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
    { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' }
  ];

  useEffect(() => {
    loadExchangeRates();
  }, []);

  useEffect(() => {
    if (exchangeRates[fromCurrency] && exchangeRates[toCurrency]) {
      calculateAllProductPrices();
    }
  }, [fromCurrency, toCurrency, exchangeRates, products]);

  const loadExchangeRates = async () => {
    setIsLoading(true);
    
    // Simular carregamento de dados de câmbio
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Dados simulados de câmbio (normalmente viriam de uma API real)
    const mockRates = {
      USD: 1.00,
      EUR: 0.85,
      GBP: 0.73,
      BRL: 5.12,
      CAD: 1.25,
      AUD: 1.35,
      JPY: 110.50,
      CHF: 0.92,
      CNY: 6.45,
      INR: 74.85
    };

    setExchangeRates(mockRates);
    setLastUpdated(new Date().toLocaleString());
    setIsLoading(false);
  };

  const calculateAllProductPrices = () => {
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    
    if (fromRate && toRate) {
      setProducts(prevProducts => 
        prevProducts.map(product => ({
          ...product,
          convertedPrice: product.price ? (parseFloat(product.price) / fromRate) * toRate : 0
        }))
      );
    }
  };

  const addProduct = () => {
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    setProducts([...products, {
      id: newId,
      name: '',
      price: '',
      shippingTime: '',
      inStock: true,
      convertedPrice: 0
    }]);
  };

  const removeProduct = (id) => {
    if (products.length > 1) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  const updateProduct = (id, field, value) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === id ? { ...product, [field]: value } : product
      )
    );
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getTotalQuotation = () => {
    return products.reduce((total, product) => {
      return total + (product.convertedPrice || 0);
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="quotation-loading">
        <div className="loading-content">
          <RefreshCw size={48} className="loading-icon" />
          <p>Carregando cotações de produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quotation-page">
      {/* Header */}
      <div className="quotation-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="quotation-title">
              <Package size={32} />
              Cotação de Produtos
            </h1>
            <p className="quotation-subtitle">
              Gerencie preços, estoque e envios dos seus produtos com conversão de moedas
            </p>
          </div>
          <div className="last-updated">
            <Clock size={16} />
            <span>Atualizado: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Currency Selector */}
      <div className="currency-section">
        <div className="currency-card">
          <div className="currency-header">
            <h2>Configuração de Moeda</h2>
            <button className="refresh-btn" onClick={loadExchangeRates}>
              <RefreshCw size={16} />
              Atualizar Taxa
            </button>
          </div>

          <div className="currency-selector">
            <div className="from-currency">
              <label>Moeda Base (Custo)</label>
              <select 
                value={fromCurrency} 
                onChange={(e) => setFromCurrency(e.target.value)}
                className="currency-select"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <button className="swap-btn" onClick={swapCurrencies} title="Trocar moedas">
              <ArrowLeftRight size={20} />
            </button>

            <div className="to-currency">
              <label>Moeda de Venda</label>
              <select 
                value={toCurrency} 
                onChange={(e) => setToCurrency(e.target.value)}
                className="currency-select"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {exchangeRates[fromCurrency] && exchangeRates[toCurrency] && (
            <div className="exchange-rate-display">
              1 {fromCurrency} = {(exchangeRates[toCurrency] / exchangeRates[fromCurrency]).toFixed(4)} {toCurrency}
            </div>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="products-section">
        <div className="products-header">
          <h2>Lista de Produtos</h2>
          <button className="add-product-btn" onClick={addProduct}>
            <Plus size={16} />
            Adicionar Produto
          </button>
        </div>

        <div className="products-list">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-header">
                <h3>Produto #{product.id}</h3>
                {products.length > 1 && (
                  <button 
                    className="remove-product-btn"
                    onClick={() => removeProduct(product.id)}
                    title="Remover produto"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="product-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nome do Produto</label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                      placeholder="Digite o nome do produto"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Preço ({fromCurrency})</label>
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                      placeholder="0.00"
                      className="form-input"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tempo de Envio</label>
                    <input
                      type="text"
                      value={product.shippingTime}
                      onChange={(e) => updateProduct(product.id, 'shippingTime', e.target.value)}
                      placeholder="Ex: 3-5 dias úteis"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Disponibilidade</label>
                    <div className="stock-toggle">
                      <button
                        className={`stock-btn ${product.inStock ? 'in-stock' : ''}`}
                        onClick={() => updateProduct(product.id, 'inStock', true)}
                      >
                        <CheckCircle size={16} />
                        Em Stock
                      </button>
                      <button
                        className={`stock-btn ${!product.inStock ? 'out-stock' : ''}`}
                        onClick={() => updateProduct(product.id, 'inStock', false)}
                      >
                        <XCircle size={16} />
                        Sem Stock
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price Conversion Display */}
                {product.price && (
                  <div className="price-conversion">
                    <div className="conversion-display">
                      <span className="original-price">
                        {parseFloat(product.price || 0).toLocaleString(undefined, { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })} {fromCurrency}
                      </span>
                      <ArrowRight size={16} className="arrow-icon" />
                      <span className="converted-price">
                        {product.convertedPrice.toLocaleString(undefined, { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })} {toCurrency}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Summary */}
      <div className="summary-section">
        <div className="summary-card">
          <div className="summary-header">
            <Calculator size={24} />
            <h2>Resumo da Cotação</h2>
          </div>
          
          <div className="summary-content">
            <div className="summary-row">
              <span>Total de Produtos:</span>
              <span className="summary-value">{products.length}</span>
            </div>
            <div className="summary-row">
              <span>Produtos em Stock:</span>
              <span className="summary-value">{products.filter(p => p.inStock).length}</span>
            </div>
            <div className="summary-row total-row">
              <span>Valor Total:</span>
              <span className="total-value">
                {getTotalQuotation().toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })} {toCurrency}
              </span>
            </div>
          </div>

          <div className="summary-actions">
            <button className="save-btn">
              <Save size={16} />
              Salvar Cotação
            </button>
            <button className="export-btn">
              <FileText size={16} />
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <div className="info-card">
          <Info size={20} />
          <div className="info-content">
            <h4>Sobre as Cotações de Produtos</h4>
            <p>
              Os preços são convertidos automaticamente usando taxas de câmbio atualizadas.
              Gerencie o estoque, tempos de envio e preços dos seus produtos de forma centralizada.
              Todas as informações podem ser exportadas para relatórios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPage;