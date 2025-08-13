import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Star, ShoppingCart, Filter, ExternalLink, Heart, Eye } from 'lucide-react';
import './ProductResearch.css';

const ProductResearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  const categories = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'electronics', label: 'Eletrônicos' },
    { value: 'clothing', label: 'Roupas & Moda' },
    { value: 'home', label: 'Casa & Jardim' },
    { value: 'health', label: 'Saúde & Beleza' },
    { value: 'sports', label: 'Esportes' }
  ];

  const priceRanges = [
    { value: 'all', label: 'Qualquer preço' },
    { value: '0-25', label: '€0 - €25' },
    { value: '25-50', label: '€25 - €50' },
    { value: '50-100', label: '€50 - €100' },
    { value: '100+', label: '€100+' }
  ];

  const mockProducts = [
    {
      id: 1,
      name: 'Wireless Gaming Headset Pro',
      category: 'electronics',
      price: 79.99,
      originalPrice: 129.99,
      discount: 38,
      rating: 4.7,
      reviews: 1247,
      sold: 3200,
      trend: 'hot',
      image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=300&h=200&fit=crop',
      tags: ['Gaming', 'Wireless', 'RGB'],
      profit_margin: '45%',
      competition: 'Medium'
    },
    {
      id: 2,
      name: 'Smartwatch Fitness Tracker',
      category: 'electronics',
      price: 45.50,
      originalPrice: 89.99,
      discount: 49,
      rating: 4.5,
      reviews: 892,
      sold: 2150,
      trend: 'rising',
      image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=300&h=200&fit=crop',
      tags: ['Fitness', 'Health', 'Smart'],
      profit_margin: '38%',
      competition: 'High'
    },
    {
      id: 3,
      name: 'Eco-Friendly Yoga Mat',
      category: 'sports',
      price: 24.99,
      originalPrice: 39.99,
      discount: 37,
      rating: 4.8,
      reviews: 567,
      sold: 1890,
      trend: 'steady',
      image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&h=200&fit=crop',
      tags: ['Yoga', 'Eco-friendly', 'Fitness'],
      profit_margin: '52%',
      competition: 'Low'
    },
    {
      id: 4,
      name: 'LED Strip Lights RGB',
      category: 'home',
      price: 18.99,
      originalPrice: 34.99,
      discount: 46,
      rating: 4.3,
      reviews: 2341,
      sold: 5670,
      trend: 'hot',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
      tags: ['LED', 'Smart Home', 'RGB'],
      profit_margin: '60%',
      competition: 'Medium'
    },
    {
      id: 5,
      name: 'Portable Phone Charger',
      category: 'electronics',
      price: 29.99,
      originalPrice: 49.99,
      discount: 40,
      rating: 4.6,
      reviews: 1456,
      sold: 4230,
      trend: 'steady',
      image: 'https://images.unsplash.com/photo-1609592918606-0b5cebc9c4d5?w=300&h=200&fit=crop',
      tags: ['Portable', 'Fast Charging', 'USB-C'],
      profit_margin: '42%',
      competition: 'High'
    },
    {
      id: 6,
      name: 'Skincare Face Mask Set',
      category: 'health',
      price: 32.50,
      originalPrice: 55.99,
      discount: 42,
      rating: 4.9,
      reviews: 789,
      sold: 1234,
      trend: 'rising',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop',
      tags: ['Skincare', 'Natural', 'Anti-aging'],
      profit_margin: '55%',
      competition: 'Low'
    }
  ];

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'hot': return '🔥';
      case 'rising': return '📈';
      default: return '📊';
    }
  };

  const getCompetitionColor = (competition) => {
    switch (competition) {
      case 'Low': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'High': return '#F44336';
      default: return '#999';
    }
  };

  return (
    <div className="product-research-container">
      <div className="research-header">
        <div className="page-title">
          <Search size={32} className="title-icon" />
          <h1>Product Research</h1>
        </div>
        <p className="subtitle">Descubra produtos em tendência e oportunidades de negócio</p>
      </div>

      <div className="search-filters">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Pesquisar produtos, categorias, tendências..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="search-btn" disabled={loading}>
            {loading ? 'Buscando...' : 'Pesquisar'}
          </button>
        </div>

        <div className="filters-row">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
            {priceRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="trending">Mais Trending</option>
            <option value="price-low">Menor Preço</option>
            <option value="price-high">Maior Preço</option>
            <option value="rating">Melhor Avaliação</option>
            <option value="profit">Maior Margem</option>
          </select>

          <button className="filter-btn">
            <Filter size={16} />
            Filtros Avançados
          </button>
        </div>
      </div>

      <div className="products-stats">
        <div className="stat">
          <span className="stat-number">2,847</span>
          <span className="stat-label">Produtos Encontrados</span>
        </div>
        <div className="stat">
          <span className="stat-number">€45.2K</span>
          <span className="stat-label">Volume de Vendas</span>
        </div>
        <div className="stat">
          <span className="stat-number">73%</span>
          <span className="stat-label">Taxa de Conversão Média</span>
        </div>
      </div>

      <div className="products-grid">
        {mockProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img src={product.image} alt={product.name} />
              <div className="product-badges">
                <span className="trend-badge">{getTrendIcon(product.trend)}</span>
                <span className="discount-badge">-{product.discount}%</span>
              </div>
              <div className="product-actions">
                <button 
                  className={`favorite-btn ${favorites.has(product.id) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(product.id)}
                >
                  <Heart size={16} />
                </button>
                <button className="view-btn">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>

            <div className="product-info">
              <div className="product-tags">
                {product.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>

              <h3 className="product-name">{product.name}</h3>

              <div className="product-rating">
                <Star size={14} fill="#ffd700" color="#ffd700" />
                <span>{product.rating}</span>
                <span className="reviews">({product.reviews} avaliações)</span>
              </div>

              <div className="product-price">
                <span className="current-price">€{product.price}</span>
                <span className="original-price">€{product.originalPrice}</span>
              </div>

              <div className="product-metrics">
                <div className="metric">
                  <ShoppingCart size={14} />
                  <span>{product.sold} vendidos</span>
                </div>
                <div className="metric">
                  <TrendingUp size={14} />
                  <span>Margem: {product.profit_margin}</span>
                </div>
              </div>

              <div className="product-competition">
                <span>Competição: </span>
                <span 
                  className="competition-level"
                  style={{ color: getCompetitionColor(product.competition) }}
                >
                  {product.competition}
                </span>
              </div>

              <div className="product-footer">
                <button className="analyze-btn">
                  <Eye size={16} />
                  Analisar Produto
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Analisando produtos e tendências...</p>
        </div>
      )}
    </div>
  );
};

export default ProductResearch;