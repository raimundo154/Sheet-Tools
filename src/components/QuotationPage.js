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
  Edit
} from 'lucide-react';
import productService from '../services/productService';
import './QuotationPage.css';

const QuotationPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  
  // Product states
  const [availableProducts, setAvailableProducts] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  
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
      const result = await productService.getProducts();
      
      if (result.success) {
        // Transformar dados do Supabase para o formato esperado pelo componente
        const transformedProducts = result.data.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price.toString(),
          shippingTime: product.shipping_time || '',
          inStock: product.in_stock,
          imagePreview: product.image_url || 'https://via.placeholder.com/150x150/b0b7c0/ffffff?text=Produto'
        }));
        
        setAvailableProducts(transformedProducts);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Erro ao carregar produtos da base de dados');
    } finally {
      setIsLoading(false);
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
        resetProductForm();
        
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

  const updateProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      setError('Por favor, preencha pelo menos o nome e preço do produto.');
      return;
    }

    setIsUpdatingProduct(true);
    setError('');
    setSuccess('');

    try {
      const result = await productService.updateProduct(editingProduct.id, {
        name: newProduct.name,
        price: newProduct.price,
        shippingTime: newProduct.shippingTime,
        inStock: newProduct.inStock,
        image: newProduct.image
      });

      if (result.success) {
        setSuccess('Produto atualizado com sucesso!');
        
        // Atualizar produto na lista local
        const updatedProductForDisplay = {
          id: result.data.id,
          name: result.data.name,
          price: result.data.price.toString(),
          shippingTime: result.data.shipping_time || '',
          inStock: result.data.in_stock,
          imagePreview: result.data.image_url || editingProduct.imagePreview
        };
        
        setAvailableProducts(availableProducts.map(p => 
          p.id === editingProduct.id ? updatedProductForDisplay : p
        ));
        
        // Resetar formulário e fechar modal
        resetProductForm();
        setEditingProduct(null);
        
        setTimeout(() => {
          setShowProductModal(false);
          setSuccess('');
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      setError('Erro ao atualizar produto na base de dados');
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const resetProductForm = () => {
    setNewProduct({
      name: '',
      price: '',
      shippingTime: '',
      inStock: true,
      image: null,
      imagePreview: null
    });
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price,
      shippingTime: product.shippingTime,
      inStock: product.inStock,
      image: null,
      imagePreview: product.imagePreview
    });
    setShowProductModal(true);
  };

  const closeModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    resetProductForm();
    setError('');
    setSuccess('');
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
              Product Quotation
            </h1>
            <p className="quotation-subtitle">
              Manage your products quotations!
            </p>
          </div>
          <button className="add-new-product-btn" onClick={() => setShowProductModal(true)}>
            <Plus size={16} />
            Add New Product
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

      {/* Products Section */}
      {availableProducts.length > 0 && (
        <div className="selected-products-section">
          <h2>Products in Quotation</h2>
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
                    <div className="dropdown-name-container">
                      <span className="dropdown-name">{product.name}</span>
                      <span className={`availability-badge ${product.inStock ? 'available' : 'unavailable'}`}>
                        {product.inStock ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                  <div className="dropdown-right">
                    <button 
                      className="edit-product-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(product);
                      }}
                      title="Editar produto"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="remove-from-quotation-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQuotation(product.id);
                      }}
                      title="Remover produto"
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
                        <span className="detail-label">Price:</span>
                        <span className="detail-value">€{parseFloat(product.price).toFixed(2)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Shipping Time:</span>
                        <span className="detail-value">{product.shippingTime}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Stock:</span>
                        <span className={`detail-value ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                          {product.inStock ? (
                            <>
                              <CheckCircle size={16} />
                              Available
                            </>
                          ) : (
                            <>
                              <XCircle size={16} />
                              Unavailable
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
              <h2>{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>
              <button 
                className="modal-close-btn"
                onClick={closeModal}
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
                <label>Product Image</label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="image-input"
                    id="product-image"
                    disabled={isCreatingProduct || isUpdatingProduct}
                  />
                  <label htmlFor="product-image" className="image-upload-label">
                    {newProduct.imagePreview ? (
                      <img src={newProduct.imagePreview} alt="Preview" className="image-preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <Upload size={32} />
                        <span>Click to upload image</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Enter product name"
                    className="form-input"
                    disabled={isCreatingProduct || isUpdatingProduct}
                  />
                </div>

                <div className="form-group">
                  <label>Price (€)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="0.00"
                    className="form-input"
                    step="0.01"
                    min="0"
                    disabled={isCreatingProduct || isUpdatingProduct}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Shipping Time</label>
                  <input
                    type="text"
                    value={newProduct.shippingTime}
                    onChange={(e) => setNewProduct({...newProduct, shippingTime: e.target.value})}
                    placeholder="e.g. 3-5 business days"
                    className="form-input"
                    disabled={isCreatingProduct || isUpdatingProduct}
                  />
                </div>

                <div className="form-group">
                  <label>Availability</label>
                  <div className="stock-toggle">
                    <button
                      className={`stock-btn ${newProduct.inStock ? 'in-stock' : ''}`}
                      onClick={() => setNewProduct({...newProduct, inStock: true})}
                      disabled={isCreatingProduct || isUpdatingProduct}
                    >
                      <CheckCircle size={16} />
                      In Stock
                    </button>
                    <button
                      className={`stock-btn ${!newProduct.inStock ? 'out-stock' : ''}`}
                      onClick={() => setNewProduct({...newProduct, inStock: false})}
                      disabled={isCreatingProduct || isUpdatingProduct}
                    >
                      <XCircle size={16} />
                      Out of Stock
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={closeModal}
                disabled={isCreatingProduct || isUpdatingProduct}
              >
                Cancel
              </button>
              <button 
                className="create-btn"
                onClick={editingProduct ? updateProduct : createProduct}
                disabled={isCreatingProduct || isUpdatingProduct}
              >
                {(isCreatingProduct || isUpdatingProduct) ? (
                  <>
                    <div className="spinner"></div>
                    {editingProduct ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    {editingProduct ? (
                      <>
                        <Edit size={16} />
                        Update Product
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create Product
                      </>
                    )}
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