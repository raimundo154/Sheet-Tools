import React from 'react';
import { motion } from 'framer-motion';
import { useUserPlan } from '../hooks/useUserPlan';
import { navigation } from '../utils/navigation';
import { 
  Lock, 
  Crown, 
  ArrowRight, 
  Loader,
  AlertTriangle
} from 'lucide-react';
import './ProtectedRoute.css';

const ProtectedRoute = ({ 
  children, 
  pageName, 
  requiredFeature = null,
  fallbackToSubscription = true 
}) => {
  const { hasPageAccess, loading, hasActivePlan, getPlanInfo } = useUserPlan();

  // Mostrar loading enquanto verifica permissões
  if (loading) {
    return (
      <div className="protected-route-loading">
        <Loader className="loading-spinner" size={48} />
        <p>Verificando permissões...</p>
      </div>
    );
  }

  // Verificar se tem acesso à página
  const hasAccess = hasPageAccess(pageName);
  
  if (hasAccess) {
    return children;
  }

  // Sem acesso - mostrar tela de upgrade
  const planInfo = getPlanInfo();
  
  return (
    <div className="protected-route">
      <motion.div 
        className="access-denied-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="access-denied-icon">
          <Lock size={64} />
        </div>

        <h1 className="access-denied-title">
          Acesso Restrito
        </h1>

        <p className="access-denied-description">
          {!hasActivePlan 
            ? "Precisas de um plano ativo para aceder a esta funcionalidade."
            : `O teu plano ${planInfo.name} não inclui acesso a esta página.`
          }
        </p>

        <div className="current-plan-info">
          <div className="plan-badge">
            <Crown size={20} />
            <span>Plano Atual: {planInfo.name}</span>
          </div>
          
          {planInfo.features.length > 0 && (
            <div className="plan-features">
              <h4>Funcionalidades incluídas:</h4>
              <ul>
                {planInfo.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="upgrade-section">
          <h3>Para aceder a esta página, precisas de:</h3>
          <div className="required-plan">
            {getRequiredPlanInfo(pageName, requiredFeature)}
          </div>
        </div>

        <div className="access-denied-actions">
          {!hasActivePlan && (
            <motion.button
              className="btn btn-trial"
              onClick={() => navigation.toSubscription()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Experimentar Grátis (10 dias)
            </motion.button>
          )}

          <motion.button
            className="btn btn-upgrade"
            onClick={() => navigation.toSubscription()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {!hasActivePlan ? 'Ver Planos' : 'Fazer Upgrade'}
            <ArrowRight size={16} />
          </motion.button>

          <button 
            className="btn btn-ghost"
            onClick={() => navigation.toDashboard()}
          >
            Voltar ao Dashboard
          </button>
        </div>

        <div className="security-note">
          <AlertTriangle size={16} />
          <span>Esta página está protegida para garantir que apenas utilizadores com planos válidos possam aceder.</span>
        </div>
      </motion.div>
    </div>
  );
};

// Obter informações do plano necessário para cada página
const getRequiredPlanInfo = (pageName, requiredFeature) => {
  const requirements = {
    'daily-roas': {
      minPlan: 'Basic',
      feature: 'Daily ROAS Profit Sheet',
      description: 'Análise automática de campanhas com recomendações inteligentes'
    },
    'quotation': {
      minPlan: 'Basic',
      feature: 'Quotation',
      description: 'Cotações de moedas em tempo real e calculadora avançada'
    },
    'campaigns': {
      minPlan: 'Standard',
      feature: 'Campaigns',
      description: 'Gestão completa de campanhas com automação e integração Facebook Ads'
    },
    'product-research': {
      minPlan: 'Expert',
      feature: 'Product Research',
      description: 'Pesquisa avançada de produtos com análise de tendências de mercado'
    }
  };

  const requirement = requirements[pageName];
  
  if (!requirement) {
    return (
      <div className="required-plan-item">
        <strong>Plano Premium</strong>
        <p>Esta funcionalidade requer um plano premium ativo.</p>
      </div>
    );
  }

  return (
    <div className="required-plan-item">
      <strong>Plano {requirement.minPlan} ou superior</strong>
      <p>{requirement.description}</p>
      <div className="feature-highlight">
        Inclui: <span>{requirement.feature}</span>
      </div>
    </div>
  );
};

export default ProtectedRoute;
