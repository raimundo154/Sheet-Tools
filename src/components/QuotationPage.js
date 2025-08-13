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
  X,
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import productService from '../services/productService';
import salesService from '../services/salesService';
import './QuotationPage.css';

const QuotationPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  
  // Product states
  const [availableProducts, setAvailableProducts] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  
  // Sales data states
  const [salesData, setSalesData] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);
  
  // Error and success states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
    setError('');
    
    try {
      // Carregar produtos e vendas em paralelo
      const [productsResult, salesResult] = await Promise.all([
        productService.getProducts(),
        loadSalesData()
      ]);
      
      if (productsResult.success) {
        // Transformar dados do Supabase para o formato esperado pelo componente
        const transformedProducts = productsResult.data.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price.toString(),
          shippingTime: product.shipping_time || '',
          inStock: product.in_stock,
          imagePreview: product.image_url || 'https://via.placeholder.com/150x150/b0b7c0/ffffff?text=Produto'
        }));
        
        setAvailableProducts(transformedProducts);
      } else {
        setError(productsResult.message);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados da base de dados');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSalesData = async () => {
    setLoadingSales(true);
    try {
      const result = await salesService.getVendas(50); // Últimas 50 vendas
      
      if (result.data && !result.error) {
        // Agrupar vendas por produto, somando quantidades
        const salesByProduct = result.data.reduce((acc, venda) => {
          const productKey = venda.produto;
          if (!acc[productKey]) {
            acc[productKey] = {
              produto: venda.produto,
              quantidade: 0,
              product_image_url: venda.product_image_url,
              total_vendas: 0
            };
          }
          acc[productKey].quantidade += venda.quantidade;
          acc[productKey].total_vendas += 1;
          return acc;
        }, {});
        
        setSalesData(Object.values(salesByProduct));
      }
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    } finally {
      setLoadingSales(false);
    }
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

  const createProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      setError('Por favor, preencha pelo menos o nome e preço do produto.');
      return;
    }

    setIsCreatingProduct(true);
    setError('');
    setSuccess('');

    try {
      const result = await productService.createProduct({
        name: newProduct.name,
        price: newProduct.price,
        shippingTime: newProduct.shippingTime,
        inStock: newProduct.inStock,
        image: newProduct.image
      });

      if (result.success) {
        setSuccess('Produto criado com sucesso!');
        
        // Adicionar o novo produto à lista local
        const newProductForDisplay = {
          id: result.data.id,
          name: result.data.name,
          price: result.data.price.toString(),
          shippingTime: result.data.shipping_time || '',
          inStock: result.data.in_stock,
          imagePreview: result.data.image_url || 'https://via.placeholder.com/150x150/b0b7c0/ffffff?text=Produto'
        };
        
        setAvailableProducts([newProductForDisplay, ...availableProducts]);
        
        // Resetar formulário
        setNewProduct({
          name: '',
          price: '',
          shippingTime: '',
          inStock: true,
          image: null,
          imagePreview: null
        });
        
        // Fechar modal após um breve delay
        setTimeout(() => {
          setShowProductModal(false);
          setSuccess('');
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      setError('Erro ao criar produto na base de dados');
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const removeFromQuotation = async (productId) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) {
      return;
    }

    try {
      const result = await productService.deleteProduct(productId);
      
      if (result.success) {
        setAvailableProducts(availableProducts.filter(p => p.id !== productId));
        if (expandedProduct === productId) {
          setExpandedProduct(null);
        }
        setSuccess('Produto removido com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message);
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      setError('Erro ao remover produto da base de dados');
      setTimeout(() => setError(''), 5000);
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
          <p>Loading products...</p>
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
              Gere as suas cotações de produtos e veja os dados de vendas!
            </p>
          </div>
          <button className="add-new-product-btn" onClick={() => setShowProductModal(true)}>
            <Plus size={16} />
            Adicionar Produto
          </button>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="message-container error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="close-message-btn">
            <X size={14} />
          </button>
        </div>
      )}

      {success && (
        <div className="message-container success-message">
          <CheckCircle size={16} />
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="close-message-btn">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Sales Data Section */}
      {salesData.length > 0 && (
        <div className="sales-data-section">
          <h2>
            <ShoppingCart size={24} />
            Dados de Vendas (Foto e Quantidade)
          </h2>
          <div className="sales-grid">
            {salesData.map((sale, index) => (
              <div key={index} className="sale-item">
                <div className="sale-image-container">
                  <img 
                    src={sale.product_image_url || `https://via.placeholder.com/80x80/e2e8f0/64748b?text=${encodeURIComponent(sale.produto.substring(0, 2))}`}
                    alt={sale.produto}
                    className="sale-product-image"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/80x80/e2e8f0/64748b?text=${encodeURIComponent(sale.produto.substring(0, 2))}`;
                    }}
                  />
                </div>
                <div className="sale-info">
                  <span className="sale-quantity">{sale.quantidade}x</span>
                  <span className="sale-product-name">{sale.produto}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                        <span className="detail-label">Preço do Fornecedor:</span>
                        <span className="detail-value">€{parseFloat(product.price).toFixed(2)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Tempo de Envio:</span>
                        <span className="detail-value">{product.shippingTime || 'Não especificado'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Estado do Stock:</span>
                        <span className={`detail-value ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                          {product.inStock ? (
                            <>
                              <CheckCircle size={16} />
                              Em Stock
                            </>
                          ) : (
                            <>
                              <XCircle size={16} />
                              Fora de Stock
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
              {/* Modal Error/Success Messages */}
              {error && (
                <div className="modal-message error-message">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="modal-message success-message">
                  <CheckCircle size={16} />
                  <span>{success}</span>
                </div>
              )}

              <div className="form-group">
                <label>Imagem do Produto</label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="image-input"
                    id="product-image"
                    disabled={isCreatingProduct}
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

              <div className="form-row">
                <div className="form-group">
                  <label>Nome do Produto</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Digite o nome do produto"
                    className="form-input"
                    disabled={isCreatingProduct}
                  />
                </div>

                <div className="form-group">
                  <label>Preço do Fornecedor (€)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="0.00"
                    className="form-input"
                    step="0.01"
                    min="0"
                    disabled={isCreatingProduct}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tempo de Envio</label>
                  <input
                    type="text"
                    value={newProduct.shippingTime}
                    onChange={(e) => setNewProduct({...newProduct, shippingTime: e.target.value})}
                    placeholder="ex: 3-5 dias úteis"
                    className="form-input"
                    disabled={isCreatingProduct}
                  />
                </div>

                <div className="form-group">
                  <label>Disponibilidade</label>
                  <div className="stock-toggle">
                    <button
                      className={`stock-btn ${newProduct.inStock ? 'in-stock' : ''}`}
                      onClick={() => setNewProduct({...newProduct, inStock: true})}
                      disabled={isCreatingProduct}
                    >
                      <CheckCircle size={16} />
                      Em Stock
                    </button>
                    <button
                      className={`stock-btn ${!newProduct.inStock ? 'out-stock' : ''}`}
                      onClick={() => setNewProduct({...newProduct, inStock: false})}
                      disabled={isCreatingProduct}
                    >
                      <XCircle size={16} />
                      Fora de Stock
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowProductModal(false)}
                disabled={isCreatingProduct}
              >
                Cancelar
              </button>
              <button 
                className="create-btn"
                onClick={createProduct}
                disabled={isCreatingProduct}
              >
                {isCreatingProduct ? (
                  <>
                    <div className="spinner"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Criar Produto
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationPage;