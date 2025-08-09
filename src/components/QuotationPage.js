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
  ShoppingBag,
  Settings,
  Globe,
  Lock,
  Zap,
  ArrowRight,
  ArrowLeft,
  Copy,
  ExternalLink
} from 'lucide-react';
import productService from '../services/productService';
import shopifyService from '../services/shopifyService';
import './QuotationPage.css';

const QuotationPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  
  // Product states
  const [availableProducts, setAvailableProducts] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  
  // Error and success states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Shopify integration states
  const [showShopifyModal, setShowShopifyModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [shopifyConfig, setShopifyConfig] = useState({
    shopName: '',
    accessToken: '',
    webhookUrl: '',
    isConnected: false
  });
  
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
    loadShopifyConfig();
  }, []);

  const loadShopifyConfig = async () => {
    try {
      const result = await shopifyService.getShopifyConfig();
      if (result.success && result.data) {
        setShopifyConfig({
          shopName: result.data.shop_name || '',
          accessToken: result.data.access_token || '',
          webhookUrl: result.data.webhook_url || '',
          isConnected: result.data.is_connected || false
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração Shopify:', error);
    }
  };

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

  // Shopify integration functions
  const shopifySteps = [
    {
      id: 0,
      title: 'Bem-vindo à Integração Shopify',
      icon: ShoppingBag,
      content: {
        title: 'Conecte sua loja Shopify',
        description: 'Sincronize automaticamente os pedidos da sua loja Shopify com o sistema de quotations.',
        benefits: [
          'Receba pedidos automaticamente',
          'Sincronização em tempo real',
          'Gestão centralizada de produtos',
          'Webhooks seguros'
        ]
      }
    },
    {
      id: 1,
      title: 'Criar App na Shopify',
      icon: Settings,
      content: {
        title: 'Configurar App Privado',
        description: 'Primeiro, você precisa criar um app privado na sua loja Shopify para obter as credenciais de acesso.',
        steps: [
          'Acesse o painel da sua loja Shopify',
          'Vá para <strong>Configurações → Apps e canais de vendas</strong>',
          'Clique em <strong>Desenvolver apps</strong>',
          'Crie um <strong>novo app</strong> para a sua loja',
          'Dê um nome ao app (ex: "Sheet Tools Integration")'
        ]
      }
    },
    {
      id: 2,
      title: 'Configurar Permissões',
      icon: Lock,
      content: {
        title: 'Ativar Permissões Necessárias',
        description: 'Configure as permissões para que o app possa acessar os dados necessários.',
        steps: [
          'No app criado, vá para <strong>Configuration</strong>',
          'Na seção <strong>Admin API access scopes</strong>:',
          'Ative <strong>read_orders</strong> (para ler pedidos)',
          'Ative <strong>read_products</strong> (para ler produtos)',
          'Ative <strong>write_orders</strong> (se precisar modificar pedidos)',
          'Clique em <strong>Save</strong>'
        ]
      }
    },
    {
      id: 3,
      title: 'Gerar Access Token',
      icon: Globe,
      content: {
        title: 'Obter Credenciais de Acesso',
        description: 'Gere o token de acesso que será usado para autenticar as chamadas à API.',
        steps: [
          'Ainda nas configurações do app, clique em <strong>Install app</strong>',
          'Confirme a instalação',
          'Após a instalação, vá para <strong>API credentials</strong>',
          'Copie o <strong>Admin API access token</strong>',
          'Guarde este token com segurança (ele será usado abaixo)'
        ],
        warning: 'Mantenha este token seguro! Ele dá acesso à sua loja Shopify.'
      }
    },
    {
      id: 4,
      title: 'Configurar Webhook',
      icon: Zap,
      content: {
        title: 'Configurar Notificações Automáticas',
        description: 'Configure webhooks para receber notificações quando novos pedidos forem criados.',
        curlCommand: `curl -X POST "https://{SHOP_NAME}.myshopify.com/admin/api/2025-01/webhooks.json" \\
-H "X-Shopify-Access-Token: {ACCESS_TOKEN}" \\
-H "Content-Type: application/json" \\
-d '{
  "webhook": {
    "topic": "orders/create",
    "address": "https://sheet-tools.com/api/shopify-webhook",
    "format": "json"
  }
}'`,
        explanation: [
          '<code>{SHOP_NAME}</code>: Nome da sua loja (sem .myshopify.com)',
          '<code>{ACCESS_TOKEN}</code>: O token que você copiou no passo anterior',
          'O webhook será enviado para nossa plataforma automaticamente'
        ]
      }
    },
    {
      id: 5,
      title: 'Testar Conexão',
      icon: CheckCircle,
      content: {
        title: 'Finalizar Configuração',
        description: 'Insira as informações da sua loja para completar a integração.',
        form: true
      }
    }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Código copiado para a área de transferência!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const nextStep = () => {
    if (currentStep < shopifySteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleShopifyConfigChange = (field, value) => {
    setShopifyConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testShopifyConnection = async () => {
    try {
      setError('');
      setSuccess('Testando conexão...');

      // Testar conexão com a Shopify via backend
      const result = await shopifyService.testConnection(
        shopifyConfig.shopName,
        shopifyConfig.accessToken,
        `${window.location.protocol}//${window.location.host}/.netlify/functions/shopify-webhook`
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      setShopifyConfig(prev => ({ ...prev, isConnected: true }));
      
      // Mostrar mensagem com status do webhook
      let successMessage = result.message;
      if (result.webhook_status === 'manual_required') {
        const webhookMsg = result.webhook_message || 'Webhook deve ser configurado manualmente';
        successMessage += `\n⚠️ ${webhookMsg}`;
      } else if (result.webhook_status === 'criado') {
        successMessage += '\n✅ Webhook configurado automaticamente! Pedidos aparecerão automaticamente.';
      }
      
      setSuccess(successMessage);
      
      setTimeout(() => {
        setShowShopifyModal(false);
        setCurrentStep(0);
        setSuccess('');
        // Recarregar configuração
        loadShopifyConfig();
      }, 4000);

    } catch (error) {
      console.error('Erro ao conectar com Shopify:', error);
      setError(error.message || 'Erro ao conectar com a Shopify. Verifique as credenciais.');
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
          <div className="header-actions">
            <button 
              className="shopify-connect-btn" 
              onClick={() => setShowShopifyModal(true)}
            >
              <ShoppingBag size={16} />
              {shopifyConfig.isConnected ? 'Shopify Conectada' : 'Conectar Shopify'}
            </button>
            <button className="add-new-product-btn" onClick={() => setShowProductModal(true)}>
              <Plus size={16} />
              Add New Product
            </button>
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
                  <label>Price (€)</label>
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
                    placeholder="e.g. 3-5 business days"
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

      {/* Shopify Integration Modal */}
      {showShopifyModal && (
        <div className="modal-overlay">
          <div className="shopify-modal">
            <div className="shopify-modal-content">
              {/* Steps Navigation */}
              <div className="steps-navigation">
                {shopifySteps.map((step, index) => {
                  const StepIcon = step.icon;
                  return (
                    <button
                      key={step.id}
                      className={`step-nav-btn ${
                        index === currentStep ? 'active' : ''
                      } ${index < currentStep ? 'completed' : ''}`}
                      onClick={() => setCurrentStep(index)}
                    >
                      <div className="step-icon">
                        <StepIcon size={20} />
                      </div>
                      <div className="step-info">
                        <div className="step-number">Passo {index + 1}</div>
                        <div className="step-title">{step.title}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Current Step Content */}
              <div className="current-step-content">
                <div className="step-header">
                  <div className="step-icon-large">
                    {React.createElement(shopifySteps[currentStep].icon, { size: 28 })}
                  </div>
                  <div>
                    <h3>{shopifySteps[currentStep].content.title}</h3>
                    <p>{shopifySteps[currentStep].content.description}</p>
                  </div>
                  <button 
                    className="modal-close-btn"
                    onClick={() => setShowShopifyModal(false)}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="step-body">
                  {/* Step 0 - Welcome */}
                  {currentStep === 0 && (
                    <div className="step-content">
                      <h4>Benefícios da Integração:</h4>
                      <ul>
                        {shopifySteps[0].content.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                      <div className="important-note">
                        <AlertCircle size={20} />
                        <span>Este processo levará cerca de 10-15 minutos para ser completado.</span>
                      </div>
                    </div>
                  )}

                  {/* Steps 1-3 - Instructions */}
                  {(currentStep >= 1 && currentStep <= 3) && (
                    <div className="step-content">
                      <h4>Instruções:</h4>
                      <ol>
                        {shopifySteps[currentStep].content.steps.map((step, index) => (
                          <li key={index} dangerouslySetInnerHTML={{ __html: step }} />
                        ))}
                      </ol>
                      {shopifySteps[currentStep].content.warning && (
                        <div className="security-warning">
                          <Lock size={20} />
                          <span>{shopifySteps[currentStep].content.warning}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 4 - Webhook Configuration */}
                  {currentStep === 4 && (
                    <div className="step-content">
                      <h4>Comando cURL para criar webhook:</h4>
                      <div className="code-block">
                        <button 
                          className="copy-btn"
                          onClick={() => copyToClipboard(shopifySteps[4].content.curlCommand)}
                        >
                          <Copy size={16} />
                        </button>
                        <pre>{shopifySteps[4].content.curlCommand}</pre>
                        <div className="code-explanation">
                          <p><strong>Substitua os seguintes valores:</strong></p>
                          {shopifySteps[4].content.explanation.map((item, index) => (
                            <p key={index} dangerouslySetInnerHTML={{ __html: item }} />
                          ))}
                        </div>
                      </div>
                      <div className="important-note">
                        <Zap size={20} />
                        <span>Execute este comando no terminal ou use uma ferramenta como Postman.</span>
                      </div>
                    </div>
                  )}

                  {/* Step 5 - Configuration Form */}
                  {currentStep === 5 && (
                    <div className="step-content">
                      <h4>Configuração da Loja:</h4>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Nome da Loja Shopify</label>
                          <input
                            type="text"
                            value={shopifyConfig.shopName}
                            onChange={(e) => handleShopifyConfigChange('shopName', e.target.value)}
                            placeholder="minha-loja (sem .myshopify.com)"
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>Access Token da API</label>
                          <input
                            type="password"
                            value={shopifyConfig.accessToken}
                            onChange={(e) => handleShopifyConfigChange('accessToken', e.target.value)}
                            placeholder="shpat_..."
                            className="form-input"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>URL do Webhook (Gerada automaticamente)</label>
                        <input
                          type="text"
                          value="https://sheet-tools.com/api/shopify-webhook"
                          className="form-input"
                          disabled
                        />
                      </div>
                      <button 
                        className="btn-primary"
                        onClick={testShopifyConnection}
                        disabled={!shopifyConfig.shopName || !shopifyConfig.accessToken}
                        style={{ 
                          width: '100%', 
                          marginTop: '1rem',
                          padding: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <ExternalLink size={16} />
                        Testar Conexão
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step Navigation Buttons */}
            <div className="step-navigation-buttons">
              <button 
                className="btn-secondary"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft size={16} />
                Anterior
              </button>
              
              <div className="step-indicator">
                {currentStep + 1} de {shopifySteps.length}
              </div>
              
              <button 
                className="btn-primary"
                onClick={nextStep}
                disabled={currentStep === shopifySteps.length - 1}
              >
                Próximo
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationPage;