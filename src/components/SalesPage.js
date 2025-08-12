import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  Package,
  Zap,
  RefreshCw
} from 'lucide-react';
import salesService from '../services/salesService';
import CustomDropdown from './CustomDropdown';
import './SalesPage.css';

const SalesPage = () => {
  const [vendas, setVendas] = useState([]);
  const [estatisticas, setEstatisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('todas');
  const [subscription, setSubscription] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  // Opções para o filtro
  const filtroOptions = [
    { value: 'todas', label: 'Todas as vendas' },
    { value: 'hoje', label: 'Hoje' },
    { value: 'paid', label: 'Pagas' },
    { value: 'pending', label: 'Pendentes' }
  ];

  // Carregar vendas iniciais
  const carregarVendas = async (tipoFiltro = filtro) => {
    try {
      setLoading(true);
      setError(null);
      
      let resultado;
      
      switch (tipoFiltro) {
        case 'hoje':
          resultado = await salesService.getVendasHoje();
          break;
        case 'paid':
        case 'pending':
          resultado = await salesService.getVendasPorStatus(tipoFiltro);
          break;
        default:
          resultado = await salesService.getVendas(100); // Carregar últimas 100
      }

      if (resultado.error) {
        throw resultado.error;
      }

      setVendas(resultado.data);
      setEstatisticas(salesService.calcularEstatisticas(resultado.data));
      setLastUpdateTime(new Date());
      
    } catch (err) {
      console.error('Erro ao carregar vendas:', err);
      setError('Erro ao carregar vendas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Configurar realtime subscription
  useEffect(() => {
    // Carregar dados iniciais
    carregarVendas();

    // Configurar subscription para tempo real
    const realtimeSubscription = salesService.subscribeToVendas((payload) => {
      console.log('🔔 Nova venda recebida:', payload);
      
      if (payload.eventType === 'INSERT') {
        // Adicionar nova venda ao início da lista
        setVendas(prev => [payload.new, ...prev]);
        
        // Recalcular estatísticas
        setVendas(current => {
          const novasEstatisticas = salesService.calcularEstatisticas(current);
          setEstatisticas(novasEstatisticas);
          return current;
        });
        
        setLastUpdateTime(new Date());
        
        // Mostrar notificação (opcional)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Nova venda!', {
            body: `${payload.new.produto} - ${salesService.formatarMoeda(payload.new.total)}`,
            icon: '/favicon.png'
          });
        }
      }
    });

    setSubscription(realtimeSubscription);

    // Solicitar permissão para notificações
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      if (realtimeSubscription) {
        salesService.unsubscribeFromVendas(realtimeSubscription);
      }
    };
  }, []);

  // Atualizar quando filtro mudar
  useEffect(() => {
    carregarVendas(filtro);
  }, [filtro]);

  // Função para refresh manual
  const handleRefresh = () => {
    carregarVendas();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#96f2d7';
      case 'pending': return '#f59e0b';
      case 'refunded': return '#ef4444';
      default: return '#b0b7c0';
    }
  };

  if (loading && vendas.length === 0) {
    return (
      <div className="sales-page">
        <div className="loading-container">
          <div className="loading-spinner">
            <RefreshCw className="spinning" size={32} />
          </div>
          <p>Carregando vendas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-page">
      {/* Header */}
      <div className="sales-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="sales-title">
              <ShoppingCart size={32} />
              Vendas em Tempo Real
            </h1>
            <p className="sales-subtitle">
              Acompanhe suas vendas Shopify em tempo real
            </p>
            <div className="last-update">
              <Clock size={14} />
              Última atualização: {salesService.formatarData(lastUpdateTime.toISOString())}
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              onClick={handleRefresh}
              className="refresh-btn"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="sales-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">
              {salesService.formatarMoeda(estatisticas.totalFaturamento || 0)}
            </h3>
            <p className="stat-label">Faturamento Total</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">
              {estatisticas.totalVendas || 0}
            </h3>
            <p className="stat-label">Total de Vendas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">
              {estatisticas.totalItens || 0}
            </h3>
            <p className="stat-label">Itens Vendidos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Zap size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">
              {estatisticas.vendaPorHora || 0}/h
            </h3>
            <p className="stat-label">Vendas por Hora</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="sales-filters">
        <CustomDropdown
          options={filtroOptions}
          value={filtro}
          onChange={setFiltro}
          className="filter-style"
          placeholder="Filtrar vendas..."
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-btn">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Lista de Vendas */}
      <div className="sales-table-section">
        <div className="section-header">
          <h2 className="section-title">
            Histórico de Vendas
          </h2>
          <div className="realtime-indicator">
            <div className="realtime-dot"></div>
            Tempo Real
          </div>
        </div>

        {vendas.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={48} />
            <h3>Nenhuma venda encontrada</h3>
            <p>As vendas aparecerão aqui em tempo real quando recebermos webhooks do Shopify.</p>
          </div>
        ) : (
          <div className="sales-table">
            <div className="table-header">
              <div className="table-cell">Produto</div>
              <div className="table-cell">Cliente</div>
              <div className="table-cell">Quantidade</div>
              <div className="table-cell">Valor</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Data</div>
            </div>
            
            {vendas.map((venda) => (
              <div key={venda.id} className="table-row">
                <div className="table-cell">
                  <div className="product-info">
                    <div className="product-image-container">
                      <img 
                        src={venda.product_image_url || `https://via.placeholder.com/60x60/e2e8f0/64748b?text=${encodeURIComponent(venda.produto.substring(0, 2))}`}
                        alt={venda.produto}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/60x60/e2e8f0/64748b?text=${encodeURIComponent(venda.produto.substring(0, 2))}`;
                        }}
                      />
                    </div>
                    <div className="product-details">
                      <strong>{venda.produto}</strong>
                      <small>#{venda.order_number}</small>
                    </div>
                  </div>
                </div>
                
                <div className="table-cell">
                  <div className="customer-info">
                    <strong>{venda.customer_name || 'N/A'}</strong>
                    <small>{venda.customer_email || 'N/A'}</small>
                  </div>
                </div>
                
                <div className="table-cell">
                  <span className="quantity-badge">
                    {venda.quantidade}x
                  </span>
                </div>
                
                <div className="table-cell">
                  <div className="price-info">
                    <strong>{salesService.formatarMoeda(venda.total)}</strong>
                    <small>{salesService.formatarMoeda(venda.preco)} cada</small>
                  </div>
                </div>
                
                <div className="table-cell">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(venda.financial_status) }}
                  >
                    {venda.financial_status}
                  </span>
                </div>
                
                <div className="table-cell">
                  <div className="date-info">
                    <span>{salesService.formatarData(venda.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesPage;
