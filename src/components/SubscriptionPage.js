import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Crown,
  ArrowRight,
  Loader,
  AlertCircle,
  Gift,
  Sparkles
} from 'lucide-react';
import subscriptionService from '../services/subscriptionService';
import authService from '../services/authService';
import { navigation } from '../utils/navigation';
import './SubscriptionPage.css';

const SubscriptionPage = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [error, setError] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' ou 'yearly'
  const [showTrialModal, setShowTrialModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Carregar planos e subscription atual em paralelo
      const [plansData, subscriptionData] = await Promise.all([
        subscriptionService.getAvailablePlans(),
        subscriptionService.getUserActiveSubscription()
      ]);

      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar informações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar planos por ciclo de cobrança
  const getFilteredPlans = () => {
    if (billingCycle === 'trial') {
      return plans.filter(plan => plan.billing_period === 'trial');
    }
    return plans.filter(plan => plan.billing_period === billingCycle);
  };

  // Organizar planos por tipo
  const organizedPlans = () => {
    const filtered = getFilteredPlans();
    const trial = plans.find(plan => plan.billing_period === 'trial');
    const monthly = plans.filter(plan => plan.billing_period === 'monthly');
    const yearly = plans.filter(plan => plan.billing_period === 'yearly');

    return { trial, monthly, yearly };
  };

  // Calcular desconto do plano anual
  const calculateDiscount = (yearlyPlan) => {
    const planName = yearlyPlan.name.replace(' Anual', '');
    const monthlyPlan = plans.find(p => 
      p.name === planName && p.billing_period === 'monthly'
    );
    
    if (!monthlyPlan) return null;
    
    return subscriptionService.calculateYearlyDiscount(monthlyPlan.price_amount);
  };

  // Obter preço original para planos anuais (preço mensal × 12)
  const getOriginalYearlyPrice = (yearlyPlan) => {
    const planName = yearlyPlan.name.replace(' Anual', '');
    const monthlyPlan = plans.find(p => 
      p.name === planName && p.billing_period === 'monthly'
    );
    
    if (!monthlyPlan) return null;
    
    return monthlyPlan.price_amount * 12; // preço mensal × 12 meses
  };

  // Verificar se plano está ativo
  const isPlanActive = (plan) => {
    return currentSubscription?.plan_name === plan.name;
  };

  // Verificar se usuário pode fazer upgrade/downgrade
  const canChangeToPlan = (plan) => {
    if (!currentSubscription) return true;
    if (currentSubscription.status === 'trialing' && plan.billing_period !== 'trial') return true;
    return !isPlanActive(plan);
  };

  // Iniciar processo de subscription
  const handleSelectPlan = async (plan) => {
    try {
      setProcessingPlan(plan.id);
      setError('');

      const user = authService.getCurrentUser();
      if (!user) {
        console.log('❌ Usuário não autenticado, redirecionando para login');
        setError('Você precisa estar logado para subscrever um plano.');
        navigation.toLogin();
        return;
      }

      console.log('✅ Usuário autenticado:', user.id, user.email);
      console.log('📦 Plano selecionado:', plan.name, plan.id);

      // Se for trial, criar diretamente
      if (plan.billing_period === 'trial') {
        console.log('🎁 Iniciando trial gratuito...');
        await subscriptionService.startFreeTrial();
        setShowTrialModal(true);
        await loadData(); // Recarregar dados
        return;
      }

      // Para planos pagos, criar checkout session
      const successUrl = `${window.location.origin}/dashboard?subscription=success`;
      const cancelUrl = `${window.location.origin}/subscription?subscription=cancelled`;

      console.log('💳 Criando checkout session...');
      console.log('🎯 Success URL:', successUrl);
      console.log('❌ Cancel URL:', cancelUrl);

      await subscriptionService.createCheckoutSession(
        plan.id,
        successUrl,
        cancelUrl
      );

    } catch (err) {
      console.error('❌ Erro ao selecionar plano:', err);
      setError(`Erro: ${err.message || 'Erro ao processar plano. Tente novamente.'}`);
    } finally {
      setProcessingPlan(null);
    }
  };

  // Gerenciar subscription
  const handleManageSubscription = async () => {
    try {
      const returnUrl = `${window.location.origin}/subscription`;
      await subscriptionService.createCustomerPortalSession(returnUrl);
    } catch (err) {
      console.error('Erro ao abrir portal:', err);
      setError('Erro ao abrir portal de gestão. Tente novamente.');
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.4 } 
    }
  };

  if (loading) {
    return (
      <div className="subscription-page">
        <div className="loading-container">
          <Loader className="loading-spinner" size={48} />
          <p>Carregando planos...</p>
        </div>
      </div>
    );
  }

  const { trial, monthly, yearly } = organizedPlans();

  return (
    <div className="subscription-page">
      {/* Header */}
      <motion.div 
        className="subscription-header"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="subscription-title">
          Escolhe o teu <span className="highlight">Plano Perfeito</span>
        </h1>
        <p className="subscription-subtitle">
          Planos simples e transparentes para automatizar as tuas campanhas Facebook
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Current Subscription Info */}
      {currentSubscription && (
        <motion.div 
          className="current-subscription"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <div className="current-subscription-content">
            <div className="current-info">
              <Crown size={24} />
              <div>
                <h3>Plano Atual: {currentSubscription.plan_name}</h3>
                <p>
                  Status: <span className={`status ${currentSubscription.status}`}>
                    {currentSubscription.status === 'trialing' ? 'Trial Ativo' : 
                     currentSubscription.status === 'active' ? 'Ativo' : currentSubscription.status}
                  </span>
                </p>
                {currentSubscription.trial_end && (
                  <p className="trial-info">
                    Trial até: {new Date(currentSubscription.trial_end).toLocaleDateString('pt-PT')}
                  </p>
                )}
              </div>
            </div>
            <button 
              className="btn btn-ghost"
              onClick={handleManageSubscription}
            >
              Gerir Subscription
            </button>
          </div>
        </motion.div>
      )}

      {/* Trial Plan (if no active subscription) */}
      {!currentSubscription && trial && (
        <motion.div 
          className="trial-section"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <div className="trial-card">
            <div className="trial-header">
              <Gift size={32} />
              <h2>Experimenta Grátis</h2>
              <p>10 dias de acesso completo, sem cartão de crédito</p>
            </div>
            
            <div className="trial-features">
              {trial.features.map((feature, index) => (
                <div key={index} className="trial-feature">
                  <Check size={16} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary btn-large"
              onClick={() => handleSelectPlan(trial)}
              disabled={processingPlan === trial.id}
            >
              {processingPlan === trial.id ? (
                <Loader className="btn-loading" size={20} />
              ) : (
                <>
                  <Sparkles size={20} />
                  Começar Trial Grátis
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Billing Cycle Toggle */}
      <motion.div 
        className="billing-toggle"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <div className="toggle-container">
          <button
            className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Mensal
          </button>
          <button
            className={`toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('yearly')}
          >
            Anual
            <span className="savings-badge">Poupa 3 meses</span>
          </button>
        </div>
      </motion.div>

      {/* Plans Grid */}
      <motion.div 
        className="plans-grid"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {getFilteredPlans().map((plan) => {
          const isPopular = plan.name.includes('Standard');
          const isCurrentPlan = isPlanActive(plan);
          const canChange = canChangeToPlan(plan);
          const discount = billingCycle === 'yearly' ? calculateDiscount(plan) : null;
          const originalYearlyPrice = plan.billing_period === 'yearly' ? getOriginalYearlyPrice(plan) : null;

          return (
            <motion.div
              key={plan.id}
              className={`plan-card ${isPopular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}
              variants={scaleIn}
              whileHover={{ 
                scale: canChange ? 1.05 : 1,
                transition: { duration: 0.2 }
              }}
            >
              {isPopular && <div className="popular-badge">Mais Popular</div>}
              {isCurrentPlan && <div className="current-badge">Plano Atual</div>}

              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  {originalYearlyPrice && (
                    <div className="original-price">
                      <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px' }}>
                        {subscriptionService.formatPrice(originalYearlyPrice)}
                      </span>
                    </div>
                  )}
                  <div className="current-price">
                    <span className="currency">€</span>
                    <span className="amount">
                      {plan.price_amount === 0 ? '0' : (plan.price_amount / 100).toFixed(2)}
                    </span>
                    <span className="period">
                      {plan.billing_period === 'trial' ? '/10 dias' :
                       plan.billing_period === 'monthly' ? '/mês' : '/ano'}
                    </span>
                  </div>
                  {discount && (
                    <div className="discount-info">
                      <strong style={{ color: '#10b981' }}>
                        Poupa {subscriptionService.formatPrice(discount.discount)} (3 meses grátis)
                      </strong>
                    </div>
                  )}
                  {originalYearlyPrice && !discount && (
                    <div className="discount-info">
                      <strong style={{ color: '#10b981' }}>
                        3 meses grátis incluídos
                      </strong>
                    </div>
                  )}
                </div>
                {plan.description && (
                  <p className="plan-description">{plan.description}</p>
                )}
              </div>

              <div className="plan-features">
                {plan.features.map((feature, index) => (
                  <div key={index} className="plan-feature">
                    <Check size={16} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="plan-footer">
                {isCurrentPlan ? (
                  <button className="btn btn-ghost btn-full" disabled>
                    <Crown size={16} />
                    Plano Atual
                  </button>
                ) : canChange ? (
                  <button
                    className={`btn ${isPopular ? 'btn-primary' : 'btn-secondary'} btn-full`}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={processingPlan === plan.id}
                  >
                    {processingPlan === plan.id ? (
                      <Loader className="btn-loading" size={16} />
                    ) : (
                      <>
                        {plan.billing_period === 'trial' ? 'Iniciar Trial' : 'Escolher Plano'}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                ) : (
                  <button className="btn btn-ghost btn-full" disabled>
                    Não Disponível
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Features Comparison */}
      <motion.div 
        className="features-comparison"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <h2>Comparação de Funcionalidades</h2>
        <div className="comparison-table">
          <div className="comparison-header">
            <div className="feature-name">Funcionalidade</div>
            <div className="plan-column">Basic</div>
            <div className="plan-column">Standard</div>
            <div className="plan-column">Expert</div>
          </div>
          
          {[
            { name: 'Daily ROAS Profit Sheet', basic: true, standard: true, expert: true },
            { name: 'Quotation', basic: true, standard: true, expert: true },
            { name: 'Campaigns', basic: false, standard: true, expert: true },
            { name: 'Product Research', basic: false, standard: false, expert: true },
            { name: 'Suporte Prioritário', basic: false, standard: true, expert: true },
            { name: 'Histórico Completo', basic: false, standard: true, expert: true }
          ].map((feature, index) => (
            <div key={index} className="comparison-row">
              <div className="feature-name">{feature.name}</div>
              <div className="plan-column">
                {feature.basic ? <Check size={16} className="check-icon" /> : <span className="dash">—</span>}
              </div>
              <div className="plan-column">
                {feature.standard ? <Check size={16} className="check-icon" /> : <span className="dash">—</span>}
              </div>
              <div className="plan-column">
                {feature.expert ? <Check size={16} className="check-icon" /> : <span className="dash">—</span>}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div 
        className="subscription-faq"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <h2>Perguntas Frequentes</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Posso cancelar a qualquer momento?</h4>
            <p>Sim! Não há fidelidade. Podes cancelar quando quiseres e continuar a usar até ao fim do período pago.</p>
          </div>
          <div className="faq-item">
            <h4>Como funciona o trial gratuito?</h4>
            <p>10 dias completamente grátis com acesso a todas as funcionalidades. Não é necessário cartão de crédito.</p>
          </div>
          <div className="faq-item">
            <h4>Posso mudar de plano?</h4>
            <p>Claro! Podes fazer upgrade ou downgrade a qualquer momento através do portal de gestão.</p>
          </div>
          <div className="faq-item">
            <h4>Que métodos de pagamento aceitam?</h4>
            <p>Cartão de crédito/débito, MB Way, e outras formas de pagamento através do Stripe.</p>
          </div>
        </div>
      </motion.div>

      {/* Trial Success Modal */}
      {showTrialModal && (
        <div className="modal-overlay" onClick={() => setShowTrialModal(false)}>
          <motion.div 
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <Sparkles size={48} className="modal-icon" />
              <h3>Trial Ativado com Sucesso!</h3>
              <p>Tens 10 dias de acesso completo a todas as funcionalidades.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowTrialModal(false);
                  navigation.toDashboard();
                }}
              >
                Ir para Dashboard
              </button>
              <button 
                className="btn btn-ghost"
                onClick={() => setShowTrialModal(false)}
              >
                Continuar Aqui
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
