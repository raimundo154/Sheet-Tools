import React, { useState, useEffect } from 'react';
import { 
  Package,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Upload,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import './QuotationPage.css';

const QuotationPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  
  // Product states
  const [availableProducts, setAvailableProducts] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  
  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    shippingTime: '',
    inStock: true,
    image: null,
    imagePreview: null
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    
    // Simular carregamento de dados
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Carregar produtos existentes (vazio inicialmente)
    setAvailableProducts([]);
    setIsLoading(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({
          ...newProduct,
          image: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const createProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Por favor, preencha pelo menos o nome e preço do produto.');
      return;
    }

    const product = {
      id: Date.now(),
      ...newProduct,
      imagePreview: newProduct.imagePreview || 'https://via.placeholder.com/150x150/b0b7c0/ffffff?text=Produto'
    };

    setAvailableProducts([...availableProducts, product]);
    setNewProduct({
      name: '',
      price: '',
      shippingTime: '',
      inStock: true,
      image: null,
      imagePreview: null
    });
    setShowProductModal(false);
  };

  const removeFromQuotation = (productId) => {
    setAvailableProducts(availableProducts.filter(p => p.id !== productId));
    if (expandedProduct === productId) {
      setExpandedProduct(null);
    }
  };

  const toggleProductExpansion = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };


  if (isLoading) {
    return (
      <div className="quotation-loading">
        <div className="loading-content">
          <Package size={48} className="loading-icon" />
          <p>Carregando produtos...</p>
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
              Gerencie seus produtos e crie cotações personalizadas
            </p>
          </div>
          <button className="add-new-product-btn" onClick={() => setShowProductModal(true)}>
            <Plus size={16} />
            Add New Product
          </button>
        </div>
      </div>

      {/* Products Section */}
      {availableProducts.length > 0 && (
        <div className="selected-products-section">
          <h2>Produtos na Cotação</h2>
          <div className="selected-products-list">
            {availableProducts.map((product) => (
              <div key={product.id} className="selected-product-dropdown">
                <div 
                  className="dropdown-header"
                  onClick={() => toggleProductExpansion(product.id)}
                >
                  <div className="dropdown-left">
                    <img 
                      src={product.imagePreview} 
                      alt={product.name}
                      className="dropdown-image"
                    />
                    <span className="dropdown-name">{product.name}</span>
                  </div>
                  <div className="dropdown-right">
                    <button 
                      className="remove-from-quotation-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQuotation(product.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                    {expandedProduct === product.id ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </div>

                {expandedProduct === product.id && (
                  <div className="dropdown-content">
                    <div className="product-details">
                      <div className="detail-row">
                        <span className="detail-label">Preço:</span>
                        <span className="detail-value">€{parseFloat(product.price).toFixed(2)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Tempo de Envio:</span>
                        <span className="detail-value">{product.shippingTime}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Stock:</span>
                        <span className={`detail-value ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                          {product.inStock ? (
                            <>
                              <CheckCircle size={16} />
                              Disponível
                            </>
                          ) : (
                            <>
                              <XCircle size={16} />
                              Indisponível
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Product Creation Modal */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="product-modal">
            <div className="modal-header">
              <h2>Criar Novo Produto</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setShowProductModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Imagem do Produto</label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="image-input"
                    id="product-image"
                  />
                  <label htmlFor="product-image" className="image-upload-label">
                    {newProduct.imagePreview ? (
                      <img src={newProduct.imagePreview} alt="Preview" className="image-preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <Upload size={32} />
                        <span>Clique para fazer upload da imagem</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Nome do Produto</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Digite o nome do produto"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Preço (€)</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  placeholder="0.00"
                  className="form-input"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Tempo de Envio</label>
                <input
                  type="text"
                  value={newProduct.shippingTime}
                  onChange={(e) => setNewProduct({...newProduct, shippingTime: e.target.value})}
                  placeholder="Ex: 3-5 dias úteis"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Disponibilidade</label>
                <div className="stock-toggle">
                  <button
                    className={`stock-btn ${newProduct.inStock ? 'in-stock' : ''}`}
                    onClick={() => setNewProduct({...newProduct, inStock: true})}
                  >
                    <CheckCircle size={16} />
                    Em Stock
                  </button>
                  <button
                    className={`stock-btn ${!newProduct.inStock ? 'out-stock' : ''}`}
                    onClick={() => setNewProduct({...newProduct, inStock: false})}
                  >
                    <XCircle size={16} />
                    Sem Stock
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowProductModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="create-btn"
                onClick={createProduct}
              >
                <Plus size={16} />
                Criar Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationPage;