import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  TrendingUp, 
  Filter, 
  Star, 
  ExternalLink,
  DollarSign,
  BarChart3,
  ShoppingCart,
  Calendar,
  Eye,
  Heart,
  Loader
} from 'lucide-react';
import PageHeader from './PageHeader';
import './ProductResearchPage.css';

const ProductResearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    trend: 'all',
    rating: 'all'
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState([]);

  // Dados mockados para demonstração
  useEffect(() => {
    loadTrends();
    loadProducts();
  }, []);

  const loadTrends = () => {
    const mockTrends = [
      { id: 1, keyword: 'Smart Home', growth: '+156%', searches: '2.3M', competition: 'Medium' },
      { id: 2, keyword: 'Sustainable Fashion', growth: '+89%', searches: '1.8M', competition: 'Low' },
      { id: 3, keyword: 'Fitness Tech', growth: '+124%', searches: '3.1M', competition: 'High' },
      { id: 4, keyword: 'Pet Accessories', growth: '+67%', searches: '1.2M', competition: 'Medium' },
      { id: 5, keyword: 'Gaming Setup', growth: '+203%', searches: '2.7M', competition: 'High' }
    ];
    setTrends(mockTrends);
  };

  const loadProducts = () => {
    setLoading(true);
    // Simular carregamento
    setTimeout(() => {
      const mockProducts = [
        {
          id: 1,
          name: 'Smart LED Strip Lights',
          category: 'Smart Home',
          price: 24.99,
          rating: 4.7,
          reviews: 15420,
          trend: 'rising',
          competition: 'medium',
          profitMargin: 68,
          monthlySearches: 89000,
          adSpend: 1.25,
          image: 'https://images.unsplash.com/photo-1558618750-fcd25c85cd64?w=300'
        },
        {
          id: 2,
          name: 'Wireless Phone Charger',
          category: 'Tech',
          price: 19.99,
          rating: 4.5,
          reviews: 8934,
          trend: 'stable',
          competition: 'high',
          profitMargin: 45,
          monthlySearches: 124000,
          adSpend: 2.15,
          image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300'
        },
        {
          id: 3,
          name: 'Eco-Friendly Water Bottle',
          category: 'Lifestyle',
          price: 34.99,
          rating: 4.8,
          reviews: 23401,
          trend: 'rising',
          competition: 'low',
          profitMargin: 72,
          monthlySearches: 67000,
          adSpend: 0.89,
          image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300'
        },
        {
          id: 4,
          name: 'Pet Training Clicker',
          category: 'Pet',
          price: 12.99,
          rating: 4.6,
          reviews: 5672,
          trend: 'rising',
          competition: 'low',
          profitMargin: 78,
          monthlySearches: 34000,
          adSpend: 0.67,
          image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300'
        },
        {
          id: 5,
          name: 'Gaming Mouse Pad RGB',
          category: 'Gaming',
          price: 29.99,
          rating: 4.4,
          reviews: 12089,
          trend: 'stable',
          competition: 'high',
          profitMargin: 52,
          monthlySearches: 78000,
          adSpend: 1.89,
          image: 'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=300'
        },
        {
          id: 6,
          name: 'Yoga Mat Premium',
          category: 'Fitness',
          price: 49.99,
          rating: 4.9,
          reviews: 18765,
          trend: 'rising',
          competition: 'medium',
          profitMargin: 65,
          monthlySearches: 156000,
          adSpend: 1.45,
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300'
        }
      ];
      setProducts(mockProducts);
      setLoading(false);
    }, 1500);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simular pesquisa
    setTimeout(() => {
      loadProducts();
    }, 1000);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="trend-icon rising" size={16} />;
      case 'falling':
        return <TrendingUp className="trend-icon falling" size={16} style={{ transform: 'rotate(180deg)' }} />;
      default:
        return <BarChart3 className="trend-icon stable" size={16} />;
    }
  };

  const getCompetitionColor = (competition) => {
    switch (competition) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="product-research-page">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <PageHeader 
          title="Product Research"
          subtitle="Descobre produtos vencedores com dados de mercado e análise de tendências avançada"
          showProfile={true}
        />
      </motion.div>

      {/* Search & Filters */}
      <motion.div 
        className="search-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Pesquisar produtos, categorias ou palavras-chave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? <Loader className="spinning" size={16} /> : 'Pesquisar'}
            </button>
          </div>
        </form>

        <div className="filters-container">
          <div className="filter-group">
            <Filter size={16} />
            <select 
              value={filters.category} 
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="filter-select"
            >
              <option value="all">Todas as Categorias</option>
              <option value="tech">Tecnologia</option>
              <option value="home">Casa & Jardim</option>
              <option value="fashion">Moda</option>
              <option value="fitness">Fitness</option>
              <option value="gaming">Gaming</option>
            </select>
          </div>

          <div className="filter-group">
            <DollarSign size={16} />
            <select 
              value={filters.priceRange} 
              onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
              className="filter-select"
            >
              <option value="all">Todos os Preços</option>
              <option value="0-25">€0 - €25</option>
              <option value="25-50">€25 - €50</option>
              <option value="50-100">€50 - €100</option>
              <option value="100+">€100+</option>
            </select>
          </div>

          <div className="filter-group">
            <TrendingUp size={16} />
            <select 
              value={filters.trend} 
              onChange={(e) => setFilters({...filters, trend: e.target.value})}
              className="filter-select"
            >
              <option value="all">Todas as Tendências</option>
              <option value="rising">Em Alta</option>
              <option value="stable">Estável</option>
              <option value="falling">Em Queda</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Trending Keywords */}
      <motion.div 
        className="trends-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="section-title">🔥 Tendências em Alta</h2>
        <div className="trends-grid">
          {trends.map((trend) => (
            <div key={trend.id} className="trend-card">
              <div className="trend-header">
                <h3>{trend.keyword}</h3>
                <span className="trend-growth">{trend.growth}</span>
              </div>
              <div className="trend-stats">
                <div className="stat">
                  <Eye size={14} />
                  <span>{trend.searches} pesquisas/mês</span>
                </div>
                <div className="stat">
                  <BarChart3 size={14} />
                  <span style={{ color: getCompetitionColor(trend.competition.toLowerCase()) }}>
                    {trend.competition} Competition
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Products Grid */}
      <motion.div 
        className="products-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="section-header">
          <h2 className="section-title">🎯 Produtos Recomendados</h2>
          <div className="results-count">
            {products.length} produtos encontrados
          </div>
        </div>

        {loading ? (
          <div className="loading-products">
            <Loader className="spinning" size={48} />
            <p>Analisando produtos...</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <motion.div 
                key={product.id} 
                className="product-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  <div className="product-badges">
                    {getTrendIcon(product.trend)}
                    <Heart size={14} className="favorite-icon" />
                  </div>
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-category">{product.category}</div>
                  
                  <div className="product-metrics">
                    <div className="metric">
                      <DollarSign size={14} />
                      <span>€{product.price}</span>
                    </div>
                    <div className="metric">
                      <Star size={14} />
                      <span>{product.rating} ({product.reviews.toLocaleString()})</span>
                    </div>
                  </div>

                  <div className="product-stats">
                    <div className="stat-row">
                      <span className="stat-label">Margem de Lucro:</span>
                      <span className="stat-value profit">{product.profitMargin}%</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Pesquisas/mês:</span>
                      <span className="stat-value">{product.monthlySearches.toLocaleString()}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">CPC Médio:</span>
                      <span className="stat-value">€{product.adSpend}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Competição:</span>
                      <span 
                        className="stat-value competition" 
                        style={{ color: getCompetitionColor(product.competition) }}
                      >
                        {product.competition}
                      </span>
                    </div>
                  </div>

                  <div className="product-actions">
                    <button className="btn-analyze">
                      <BarChart3 size={16} />
                      Analisar
                    </button>
                    <button className="btn-external">
                      <ExternalLink size={16} />
                      Ver Produto
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProductResearchPage;
