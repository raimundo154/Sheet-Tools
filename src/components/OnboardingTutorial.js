import React, { useState } from 'react';
import { 
  CheckCircle, 
  Facebook, 
  ShoppingBag, 
  ArrowRight, 
  X,
  SkipForward,
  ChevronRight,
  Copy,
  ExternalLink,
  Settings
} from 'lucide-react';
import './OnboardingTutorial.css';

const OnboardingTutorial = ({ onComplete, onSkip }) => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showShopifyModal, setShowShopifyModal] = useState(false);

  const steps = [
    {
      id: 'facebook',
      title: 'Conectar conta do Facebook',
      description: 'Conecte sua conta do Facebook para importar campanhas e métricas de anúncios.',
      icon: Facebook,
      color: '#1877F2',
      action: 'Conectar Facebook',
      details: [
        'Importe campanhas automaticamente',
        'Sincronize métricas de performance',
        'Gerencie anúncios em tempo real'
      ]
    },
    {
      id: 'shopify',
      title: 'Conectar conta do Shopify',
      description: 'Configure sua loja Shopify com webhook e domínio para sincronizar vendas em tempo real.',
      icon: ShoppingBag,
      color: '#96BF48',
      action: 'Conectar Shopify',
      details: [
        'Configure webhook: https://seu-site.netlify.app/.netlify/functions/shopify-webhook',
        'Adicione seu domínio da loja Shopify',
        'Sincronize vendas em tempo real'
      ]
    }
  ];

  const handleStepComplete = (stepId) => {
    if (stepId === 'shopify') {
      setShowShopifyModal(true);
      return;
    }
    
    if (!completedSteps.includes(stepId)) {
      const newCompletedSteps = [...completedSteps, stepId];
      setCompletedSteps(newCompletedSteps);
      
      if (newCompletedSteps.length === steps.length) {
        // Todos os passos foram completados
        setTimeout(() => onComplete(), 1000);
      }
    }
  };

  const handleShopifySetupComplete = () => {
    setShowShopifyModal(false);
    if (!completedSteps.includes('shopify')) {
      const newCompletedSteps = [...completedSteps, 'shopify'];
      setCompletedSteps(newCompletedSteps);
      
      if (newCompletedSteps.length === steps.length) {
        setTimeout(() => onComplete(), 1000);
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleSkipTutorial = () => {
    onSkip();
  };

  const progressPercentage = ((completedSteps.length) / steps.length) * 100;

  const ShopifySetupModal = () => (
    <div className="shopify-modal-overlay">
      <div className="shopify-modal">
        <div className="modal-header">
          <div className="modal-title">
            <ShoppingBag size={24} color="#96BF48" />
            <h2>Configuração Shopify</h2>
          </div>
          <button 
            onClick={() => setShowShopifyModal(false)}
            className="modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="setup-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Configure o Webhook</h3>
              <p>No painel da Shopify, vá para <strong>Configurações → Notificações → Webhooks</strong></p>
              <div className="webhook-config">
                <label>URL do Webhook:</label>
                <div className="copy-field">
                  <input 
                    type="text" 
                    value="https://seu-site.netlify.app/.netlify/functions/shopify-webhook"
                    readOnly 
                  />
                  <button 
                    onClick={() => copyToClipboard('https://seu-site.netlify.app/.netlify/functions/shopify-webhook')}
                    className="copy-btn"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <div className="webhook-settings">
                  <p><strong>Evento:</strong> Order creation</p>
                  <p><strong>Formato:</strong> JSON</p>
                  <p><strong>Versão da API:</strong> 2023-10</p>
                </div>
              </div>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Domínio da Loja</h3>
              <p>Insira o domínio da sua loja Shopify</p>
              <div className="domain-input">
                <input 
                  type="text" 
                  placeholder="exemplo.myshopify.com"
                  className="domain-field"
                />
                <button className="save-domain-btn">Salvar</button>
              </div>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Teste a Integração</h3>
              <p>Faça uma venda teste na sua loja para verificar se o webhook está funcionando.</p>
              <div className="test-integration">
                <button 
                  className="test-btn"
                  onClick={() => window.open('https://seu-site.netlify.app/sales', '_blank')}
                >
                  <ExternalLink size={16} />
                  Ver Página de Vendas
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            onClick={() => setShowShopifyModal(false)}
            className="skip-btn"
          >
            Configurar Depois
          </button>
          <button 
            onClick={handleShopifySetupComplete}
            className="complete-btn"
          >
            <CheckCircle size={16} />
            Marcar como Concluído
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showShopifyModal && <ShopifySetupModal />}
      <div className="onboarding-banner">
      <div className="banner-content">
        {/* Left side - Title and progress */}
        <div className="banner-left">
          <div className="banner-title">
            <h3>Configuração Inicial</h3>
            <span className="progress-text">
              {completedSteps.length} de {steps.length} completos
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Center - Steps */}
        <div className="banner-steps">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isCompleted = completedSteps.includes(step.id);
            
            return (
              <React.Fragment key={step.id}>
                <div className={`banner-step ${isCompleted ? 'completed' : 'pending'}`}>
                  <div 
                    className="step-icon-small"
                    style={{ 
                      backgroundColor: isCompleted ? '#22c55e' : `${step.color}20`,
                      color: isCompleted ? '#ffffff' : step.color
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle size={16} />
                    ) : (
                      <IconComponent size={16} />
                    )}
                  </div>
                  <div className="step-info-small">
                    <span className="step-name">{step.title}</span>
                    {!isCompleted && (
                      <button 
                        className="connect-btn"
                        onClick={() => handleStepComplete(step.id)}
                        style={{ borderColor: step.color, color: step.color }}
                      >
                        {step.action}
                      </button>
                    )}
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <ChevronRight size={16} className="step-separator" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right side - Actions */}
        <div className="banner-actions">
          <button 
            className="skip-tutorial-btn-small"
            onClick={handleSkipTutorial}
            title="Pular tutorial"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;

// Para manter compatibilidade, também exportamos a versão modal
export const OnboardingModal = ({ onComplete, onSkip }) => {
  // Código do modal original seria aqui se necessário
  return null;
};