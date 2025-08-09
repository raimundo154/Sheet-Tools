import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  RefreshCw, 
  Calculator,
  ArrowRight,
  ArrowLeftRight,
  Globe,
  Clock,
  Info
} from 'lucide-react';
import './QuotationPage.css';

const QuotationPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [exchangeRates, setExchangeRates] = useState({});
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('100');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');

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

  const popularPairs = [
    { from: 'USD', to: 'EUR', label: 'USD → EUR' },
    { from: 'EUR', to: 'USD', label: 'EUR → USD' },
    { from: 'USD', to: 'GBP', label: 'USD → GBP' },
    { from: 'GBP', to: 'USD', label: 'GBP → USD' },
    { from: 'USD', to: 'BRL', label: 'USD → BRL' },
    { from: 'EUR', to: 'BRL', label: 'EUR → BRL' }
  ];

  useEffect(() => {
    loadExchangeRates();
  }, []);

  useEffect(() => {
    if (exchangeRates[fromCurrency] && exchangeRates[toCurrency] && amount) {
      calculateConversion();
    }
  }, [fromCurrency, toCurrency, amount, exchangeRates]);

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

  const calculateConversion = () => {
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    const numAmount = parseFloat(amount) || 0;
    
    if (fromRate && toRate) {
      const converted = (numAmount / fromRate) * toRate;
      setConvertedAmount(converted);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const selectPopularPair = (pair) => {
    setFromCurrency(pair.from);
    setToCurrency(pair.to);
  };

  if (isLoading) {
    return (
      <div className="quotation-loading">
        <div className="loading-content">
          <RefreshCw size={48} className="loading-icon" />
          <p>Carregando cotações...</p>
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
              <DollarSign size={32} />
              Cotação de Moedas
            </h1>
            <p className="quotation-subtitle">
              Converta moedas com taxas atualizadas em tempo real
            </p>
          </div>
          <div className="last-updated">
            <Clock size={16} />
            <span>Atualizado: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Main Converter */}
      <div className="converter-section">
        <div className="converter-card">
          <div className="converter-header">
            <h2>Conversor de Moedas</h2>
            <button className="refresh-btn" onClick={loadExchangeRates}>
              <RefreshCw size={16} />
              Atualizar
            </button>
          </div>

          <div className="converter-form">
            <div className="amount-input">
              <label>Valor</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Digite o valor"
                className="amount-field"
              />
            </div>

            <div className="currency-selector">
              <div className="from-currency">
                <label>De</label>
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

              <button className="swap-btn" onClick={swapCurrencies}>
                <ArrowLeftRight size={20} />
              </button>

              <div className="to-currency">
                <label>Para</label>
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

            <div className="conversion-result">
              <div className="result-display">
                <span className="from-amount">
                  {parseFloat(amount || 0).toLocaleString()} {fromCurrency}
                </span>
                <ArrowRight size={20} className="arrow-icon" />
                <span className="to-amount">
                  {convertedAmount.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })} {toCurrency}
                </span>
              </div>
              
              {exchangeRates[fromCurrency] && exchangeRates[toCurrency] && (
                <div className="exchange-rate">
                  1 {fromCurrency} = {(exchangeRates[toCurrency] / exchangeRates[fromCurrency]).toFixed(4)} {toCurrency}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Pairs */}
      <div className="popular-pairs-section">
        <h3>Pares Populares</h3>
        <div className="pairs-grid">
          {popularPairs.map((pair, index) => {
            const rate = exchangeRates[pair.from] && exchangeRates[pair.to] 
              ? (exchangeRates[pair.to] / exchangeRates[pair.from]).toFixed(4)
              : 'N/A';

            return (
              <button
                key={index}
                className="pair-card"
                onClick={() => selectPopularPair(pair)}
              >
                <div className="pair-label">{pair.label}</div>
                <div className="pair-rate">{rate}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Rates Overview */}
      <div className="rates-overview-section">
        <h3>Visão Geral das Taxas (Base: USD)</h3>
        <div className="rates-grid">
          {currencies.filter(c => c.code !== 'USD').map(currency => (
            <div key={currency.code} className="rate-card">
              <div className="rate-header">
                <span className="currency-flag">{currency.flag}</span>
                <span className="currency-code">{currency.code}</span>
              </div>
              <div className="rate-value">
                {exchangeRates[currency.code]?.toFixed(4) || 'N/A'}
              </div>
              <div className="rate-change">
                <TrendingUp size={14} />
                <span className="change-positive">+0.12%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <div className="info-card">
          <Info size={20} />
          <div className="info-content">
            <h4>Sobre as Cotações</h4>
            <p>
              As taxas de câmbio são atualizadas regularmente e baseadas em dados de mercado.
              Para transações comerciais, sempre verifique as taxas atuais com seu banco ou
              instituição financeira.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPage;