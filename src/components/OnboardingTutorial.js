import React, { useState } from 'react';
import { 
  CheckCircle, 
  Facebook, 
  ShoppingBag, 
  ArrowRight, 
  X,
  SkipForward,
  ChevronRight
} from 'lucide-react';
import './OnboardingTutorial.css';

const OnboardingTutorial = ({ onComplete, onSkip }) => {
  const [completedSteps, setCompletedSteps] = useState([]);

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
      description: 'Conecte sua loja Shopify para sincronizar produtos e vendas.',
      icon: ShoppingBag,
      color: '#96BF48',
      action: 'Conectar Shopify',
      details: [
        'Sincronize catálogo de produtos',
        'Importe dados de vendas',
        'Calcule ROAS automaticamente'
      ]
    }
  ];

  const handleStepComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      const newCompletedSteps = [...completedSteps, stepId];
      setCompletedSteps(newCompletedSteps);
      
      if (newCompletedSteps.length === steps.length) {
        // Todos os passos foram completados
        setTimeout(() => onComplete(), 1000);
      }
    }
  };

  const handleSkipTutorial = () => {
    onSkip();
  };

  const progressPercentage = ((completedSteps.length) / steps.length) * 100;

  return (
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