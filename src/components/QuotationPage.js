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
  ShoppingCart,
  Edit2,
  Save,
  RotateCcw
} from 'lucide-react';
import productService from '../services/productService';
import salesService from '../services/salesService';
import ProfilePhoto from './ProfilePhoto';
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
  
  // Editing states
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  
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
      // Load products and sales in parallel
      const [productsResult, salesProducts] = await Promise.all([
        productService.getProducts(),
        loadSalesData()
      ]);
      
      // Transform products from database
      let allProducts = [];
      
      if (productsResult.success) {
        const transformedProducts = productsResult.data.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price.toString(),
          shippingTime: product.shipping_time || '',
          inStock: product.in_stock,
          imagePreview: product.image_url || 'https://via.placeholder.com/150x150/b0b7c0/ffffff?text=Product',
          isFromSales: false
        }));
        allProducts = [...transformedProducts];
      }
      
      // Add sales products that don't exist in the list yet
      if (salesProducts.length > 0) {
        salesProducts.forEach(salesProduct => {
          // Check if product with same name already exists
          const existingProduct = allProducts.find(p => 
            p.name.toLowerCase() === salesProduct.name.toLowerCase()
          );
          
          if (!existingProduct) {
            // Add new product from sales
            allProducts.push(salesProduct);
          } else {
            // If already exists, add sales information to existing
            existingProduct.quantidadeVendida = salesProduct.quantidadeVendida;
            existingProduct.totalVendas = salesProduct.totalVendas;
          }
        });
      }
      
      console.log('Final combined products:', allProducts);
      setAvailableProducts(allProducts);
      
      if (!productsResult.success && salesProducts.length === 0) {
        setError('Error loading products from database');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error loading data from database');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSalesData = async () => {
    setLoadingSales(true);
    try {
      const result = await salesService.getVendas(50); // Last 50 sales
      
      if (result.data && !result.error) {
        // Group sales by product, summing quantities
        const salesByProduct = result.data.reduce((acc, venda) => {
          const productKey = venda.produto;
          if (!acc[productKey]) {
            acc[productKey] = {
              id: `sale_${productKey.replace(/\s+/g, '_').toLowerCase()}`, // Unique ID based on name
              name: venda.produto,
              price: '0.00', // Supplier price - can be edited
              shippingTime: '', // Can be edited
              inStock: true, // Assume in stock by default
              imagePreview: venda.product_image_url || `https://via.placeholder.com/150x150/e2e8f0/64748b?text=${encodeURIComponent(venda.produto.substring(0, 2))}`,
              quantidadeVendida: 0, // New property to show quantity sold
              isFromSales: true, // Flag to identify it came from sales
              totalVendas: 0
            };
          }
          acc[productKey].quantidadeVendida += venda.quantidade;
          acc[productKey].totalVendas += 1;
          return acc;
        }, {});
        
        const salesProductsArray = Object.values(salesByProduct);
        console.log('Sales products loaded:', salesProductsArray);
        setSalesData(salesProductsArray);
        return salesProductsArray;
      }
      return [];
    } catch (error) {
      console.error('Error loading sales:', error);
      return [];
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
      setError('Please fill in at least the product name and price.');
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
        setSuccess('Product created successfully!');
        
        // Add the new product to local list
        const newProductForDisplay = {
          id: result.data.id,
          name: result.data.name,
          price: result.data.price.toString(),
          shippingTime: result.data.shipping_time || '',
          inStock: result.data.in_stock,
          imagePreview: result.data.image_url || 'https://via.placeholder.com/150x150/b0b7c0/ffffff?text=Product'
        };
        
        setAvailableProducts([newProductForDisplay, ...availableProducts]);
        
        // Reset form
        setNewProduct({
          name: '',
          price: '',
          shippingTime: '',
          inStock: true,
          image: null,
          imagePreview: null
        });
        
        // Close modal after brief delay
        setTimeout(() => {
          setShowProductModal(false);
          setSuccess('');
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setError('Error creating product in database');
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const removeFromQuotation = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const result = await productService.deleteProduct(productId);
      
      if (result.success) {
        setAvailableProducts(availableProducts.filter(p => p.id !== productId));
        if (expandedProduct === productId) {
          setExpandedProduct(null);
        }
        setSuccess('Product removed successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message);
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error removing product:', error);
      setError('Error removing product from database');
      setTimeout(() => setError(''), 5000);
    }
  };

  const toggleProductExpansion = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  // Editing functions
  const startEditing = (productId, field, currentValue) => {
    setEditingProduct(productId);
    setEditingField(field);
    setEditingValue(currentValue || '');
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setEditingField(null);
    setEditingValue('');
  };

  const saveEdit = async (productId) => {
    try {
      // Find the product
      const product = availableProducts.find(p => p.id === productId);
      if (!product) return;

      // Prepare updated data
      const updatedData = { ...product };
      
      if (editingField === 'price') {
        updatedData.price = editingValue;
      } else if (editingField === 'shippingTime') {
        updatedData.shippingTime = editingValue;
      } else if (editingField === 'inStock') {
        updatedData.inStock = editingValue === 'true';
      }

      // If product is not from sales (has real ID), update in database
      if (!product.isFromSales && typeof product.id === 'number') {
        const result = await productService.updateProduct(product.id, {
          name: updatedData.name,
          price: parseFloat(updatedData.price),
          shippingTime: updatedData.shippingTime,
          inStock: updatedData.inStock
        });

        if (!result.success) {
          setError(result.message);
          return;
        }
      }

      // Update local state
      setAvailableProducts(products => 
        products.map(p => p.id === productId ? updatedData : p)
      );

      setSuccess('Product updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      cancelEditing();
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Error updating product');
      setTimeout(() => setError(''), 5000);
    }
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
      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="page-title">
              <span className="title-highlight">Product Quotation</span>
            </h1>
            <p className="page-subtitle">
              Generate your product quotes and view sales data!
            </p>
          </div>
          
          <div className="header-actions">
            <button className="add-new-product-btn" onClick={() => setShowProductModal(true)}>
              <Plus size={16} />
              Add Product
            </button>
            <div className="header-profile">
              <ProfilePhoto 
                size="medium" 
                showUploadOptions={true}
              />
            </div>
          </div>
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
                      onError={(e) => {
                        console.log('Error loading image:', product.imagePreview);
                        e.target.src = `https://via.placeholder.com/50x50/e2e8f0/64748b?text=${encodeURIComponent(product.name.substring(0, 2))}`;
                      }}
                    />
                    <div className="product-name-container">
                      <span className="dropdown-name">{product.name}</span>
                      {product.quantidadeVendida && (
                        <span className="sales-badge">
                          <ShoppingCart size={12} />
                          {product.quantidadeVendida}x sold
                        </span>
                      )}
                    </div>
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
                      {product.quantidadeVendida && (
                        <div className="detail-row sales-highlight">
                          <span className="detail-label">Quantity Sold:</span>
                          <span className="detail-value sales-quantity">
                            <ShoppingCart size={16} />
                            {product.quantidadeVendida}x ({product.totalVendas} sales)
                          </span>
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="detail-label">Supplier Price:</span>
                        <div className="detail-value-container">
                          {editingProduct === product.id && editingField === 'price' ? (
                            <div className="editing-container">
                              <input
                                type="number"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className="edit-input"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                autoFocus
                              />
                              <div className="edit-actions">
                                <button 
                                  className="save-btn"
                                  onClick={() => saveEdit(product.id)}
                                >
                                  <Save size={14} />
                                </button>
                                <button 
                                  className="cancel-btn"
                                  onClick={cancelEditing}
                                >
                                  <RotateCcw size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="value-with-edit">
                              <span className="detail-value">€{parseFloat(product.price).toFixed(2)}</span>
                              <button 
                                className="edit-btn"
                                onClick={() => startEditing(product.id, 'price', product.price)}
                              >
                                <Edit2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Shipping Time:</span>
                        <div className="detail-value-container">
                          {editingProduct === product.id && editingField === 'shippingTime' ? (
                            <div className="editing-container">
                              <input
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className="edit-input"
                                placeholder="e.g: 3-5 business days"
                                autoFocus
                              />
                              <div className="edit-actions">
                                <button 
                                  className="save-btn"
                                  onClick={() => saveEdit(product.id)}
                                >
                                  <Save size={14} />
                                </button>
                                <button 
                                  className="cancel-btn"
                                  onClick={cancelEditing}
                                >
                                  <RotateCcw size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="value-with-edit">
                              <span className="detail-value">{product.shippingTime || 'Not specified'}</span>
                              <button 
                                className="edit-btn"
                                onClick={() => startEditing(product.id, 'shippingTime', product.shippingTime)}
                              >
                                <Edit2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Stock Status:</span>
                        <div className="detail-value-container">
                          {editingProduct === product.id && editingField === 'inStock' ? (
                            <div className="editing-container">
                              <select
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className="edit-select"
                                autoFocus
                              >
                                <option value="true">In Stock</option>
                                <option value="false">Out of Stock</option>
                              </select>
                              <div className="edit-actions">
                                <button 
                                  className="save-btn"
                                  onClick={() => saveEdit(product.id)}
                                >
                                  <Save size={14} />
                                </button>
                                <button 
                                  className="cancel-btn"
                                  onClick={cancelEditing}
                                >
                                  <RotateCcw size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="value-with-edit">
                              <span className={`detail-value ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                                {product.inStock ? (
                                  <>
                                    <CheckCircle size={16} />
                                    In Stock
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={16} />
                                    Out of Stock
                                  </>
                                )}
                              </span>
                              <button 
                                className="edit-btn"
                                onClick={() => startEditing(product.id, 'inStock', product.inStock.toString())}
                              >
                                <Edit2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {product.isFromSales && (
                        <div className="detail-row">
                          <span className="detail-label">Source:</span>
                          <span className="detail-value sales-origin">
                            Shopify Sales Data
                          </span>
                        </div>
                      )}
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
              <h2>Create New Product</h2>
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
                <label>Product Image</label>
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
                    disabled={isCreatingProduct}
                  />
                </div>

                <div className="form-group">
                  <label>Supplier Price (€)</label>
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
                  <label>Shipping Time</label>
                  <input
                    type="text"
                    value={newProduct.shippingTime}
                    onChange={(e) => setNewProduct({...newProduct, shippingTime: e.target.value})}
                    placeholder="e.g: 3-5 business days"
                    className="form-input"
                    disabled={isCreatingProduct}
                  />
                </div>

                <div className="form-group">
                  <label>Availability</label>
                  <div className="stock-toggle">
                    <button
                      className={`stock-btn ${newProduct.inStock ? 'in-stock' : ''}`}
                      onClick={() => setNewProduct({...newProduct, inStock: true})}
                      disabled={isCreatingProduct}
                    >
                      <CheckCircle size={16} />
                      In Stock
                    </button>
                    <button
                      className={`stock-btn ${!newProduct.inStock ? 'out-stock' : ''}`}
                      onClick={() => setNewProduct({...newProduct, inStock: false})}
                      disabled={isCreatingProduct}
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
                onClick={() => setShowProductModal(false)}
                disabled={isCreatingProduct}
              >
                Cancel
              </button>
              <button 
                className="create-btn"
                onClick={createProduct}
                disabled={isCreatingProduct}
              >
                {isCreatingProduct ? (
                  <>
                    <div className="spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Product
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