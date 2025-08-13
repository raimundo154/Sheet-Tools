import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Crown, 
  ArrowRight, 
  Check,
  Zap,
  Sparkles
} from 'lucide-react';
import { navigation } from '../utils/navigation';
import { useFeatureAccess } from '../hooks/useSubscription';
import './FeaturePaywall.css';

const FeaturePaywall = ({ 
  featureName, 
  title, 
  description, 
  children,
  showTrialButton = true,
  customUpgradeText = null 
}) => {
  const { hasAccess, loading, hasActiveSubscription } = useFeatureAccess(featureName);

  // Se está carregando, mostrar loading
  if (loading) {
    return (
      <div className="paywall-loading">
        <div className="loading-spinner"></div>
        <p>Verificando acesso...</p>
      </div>
    );
  }

  // Se tem acesso, mostrar o conteúdo
  if (hasAccess) {
    return children;
  }

  // Se não tem acesso, mostrar paywall
  return (
    <div className="feature-paywall">
      <motion.div 
        className="paywall-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="paywall-icon">
          <Lock size={48} />
        </div>

        <h2 className="paywall-title">{title}</h2>
        <p className="paywall-description">{description}</p>

        <div className="paywall-feature-info">
          <div className="feature-badge">
            <Crown size={20} />
            <span>Funcionalidade Premium</span>
          </div>
          
          <div className="feature-benefits">
            <h4>Esta funcionalidade inclui:</h4>
            <div className="benefits-list">
              {getFeatureBenefits(featureName).map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <Check size={16} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="paywall-actions">
          {!hasActiveSubscription && showTrialButton && (
            <motion.button
              className="btn btn-trial"
              onClick={() => navigation.toSubscription()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles size={20} />
              Experimentar Grátis (10 dias)
            </motion.button>
          )}

          <motion.button
            className="btn btn-upgrade"
            onClick={() => navigation.toSubscription()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap size={20} />
            {customUpgradeText || getUpgradeText(featureName)}
            <ArrowRight size={16} />
          </motion.button>
        </div>

        <div className="paywall-guarantee">
          <p>✅ Sem compromisso • Cancela quando quiseres • Suporte incluído</p>
        </div>
      </motion.div>
    </div>
  );
};

// Obter benefícios específicos de cada feature
const getFeatureBenefits = (featureName) => {
  const benefits = {
    'Daily ROAS Profit Sheet': [
      'Cálculo automático de métricas',
      'Recomendações inteligentes',
      'Análise de performance em tempo real',
      'Exportação de relatórios'
    ],
    'Quotation': [
      'Cotações de moedas em tempo real',
      'Histórico de conversões',
      'Alertas de mudanças de preço',
      'Calculadora avançada'
    ],
    'Campaigns': [
      'Gestão completa de campanhas',
      'Automação de decisões',
      'Integração com Facebook Ads',
      'Análise de ROI avançada'
    ],
    'Product Research': [
      'Pesquisa avançada de produtos',
      'Análise de tendências',
      'Dados de mercado detalhados',
      'Recomendações personalizadas'
    ]
  };

  return benefits[featureName] || [
    'Funcionalidade premium',
    'Dados em tempo real',
    'Suporte prioritário'
  ];
};

// Obter texto específico do botão de upgrade
const getUpgradeText = (featureName) => {
  const upgradeTexts = {
    'Daily ROAS Profit Sheet': 'Upgrade para Basic',
    'Quotation': 'Upgrade para Basic',
    'Campaigns': 'Upgrade para Standard',
    'Product Research': 'Upgrade para Expert'
  };

  return upgradeTexts[featureName] || 'Ver Planos';
};

// Componente específico para cada funcionalidade
export const DailyRoasPaywall = ({ children }) => (
  <FeaturePaywall
    featureName="Daily ROAS Profit Sheet"
    title="Daily ROAS Profit Sheet"
    description="Automatiza o cálculo de métricas e recebe recomendações inteligentes para as tuas campanhas."
    children={children}
  />
);

export const QuotationPaywall = ({ children }) => (
  <FeaturePaywall
    featureName="Quotation"
    title="Cotação de Moedas"
    description="Acede a cotações em tempo real e ferramentas avançadas de conversão de moedas."
    children={children}
  />
);

export const CampaignsPaywall = ({ children }) => (
  <FeaturePaywall
    featureName="Campaigns"
    title="Gestão de Campanhas"
    description="Gere as tuas campanhas Facebook com automação e análise avançada de performance."
    children={children}
  />
);

export const ProductResearchPaywall = ({ children }) => (
  <FeaturePaywall
    featureName="Product Research"
    title="Pesquisa de Produtos"
    description="Descobre produtos vencedores com dados de mercado e análise de tendências avançada."
    children={children}
  />
);

export default FeaturePaywall;
