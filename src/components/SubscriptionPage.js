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
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'
  const [showTrialModal, setShowTrialModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load plans and current subscription in parallel
      const [plansData, subscriptionData] = await Promise.all([
        subscriptionService.getAvailablePlans(),
        subscriptionService.getUserActiveSubscription()
      ]);

      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error loading information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter plans by billing cycle
  const getFilteredPlans = () => {
    if (billingCycle === 'trial') {
      return plans.filter(plan => plan.billing_period === 'trial');
    }
    return plans.filter(plan => plan.billing_period === billingCycle);
  };

  // Organize plans by type
  const organizedPlans = () => {
    const filtered = getFilteredPlans();
    const trial = plans.find(plan => plan.billing_period === 'trial');
    const monthly = plans.filter(plan => plan.billing_period === 'monthly');
    const yearly = plans.filter(plan => plan.billing_period === 'yearly');

    return { trial, monthly, yearly };
  };

  // Calculate annual plan discount
  const calculateDiscount = (yearlyPlan) => {
    const planName = yearlyPlan.name.replace(' Anual', '');
    const monthlyPlan = plans.find(p => 
      p.name === planName && p.billing_period === 'monthly'
    );
    
    if (!monthlyPlan) return null;
    
    return subscriptionService.calculateYearlyDiscount(monthlyPlan.price_amount);
  };

  // Get original price for annual plans (monthly price × 12)
  const getOriginalYearlyPrice = (yearlyPlan) => {
    const planName = yearlyPlan.name.replace(' Anual', '');
    const monthlyPlan = plans.find(p => 
      p.name === planName && p.billing_period === 'monthly'
    );
    
    if (!monthlyPlan) return null;
    
    return monthlyPlan.price_amount * 12; // monthly price × 12 months
  };

  // Check if plan is active
  const isPlanActive = (plan) => {
    return currentSubscription?.plan_name === plan.name;
  };

  // Check if user can upgrade/downgrade
  const canChangeToPlan = (plan) => {
    if (!currentSubscription) return true;
    if (currentSubscription.status === 'trialing' && plan.billing_period !== 'trial') return true;
    return !isPlanActive(plan);
  };

  // Start subscription process
  const handleSelectPlan = async (plan) => {
    try {
      setProcessingPlan(plan.id);
      setError('');

      const user = authService.getCurrentUser();
      if (!user) {
        console.log('❌ User not authenticated, redirecting to login');
        setError('You need to be logged in to subscribe to a plan.');
        navigation.toLogin();
        return;
      }

      console.log('✅ User authenticated:', user.id, user.email);
      console.log('📦 Selected plan:', plan.name, plan.id);

      // If trial, create directly
      if (plan.billing_period === 'trial') {
        console.log('🎁 Starting free trial...');
        await subscriptionService.startFreeTrial();
        setShowTrialModal(true);
        await loadData(); // Reload data
        return;
      }

      // For paid plans, create checkout session
      const successUrl = `${window.location.origin}/dashboard?subscription=success`;
      const cancelUrl = `${window.location.origin}/subscription?subscription=cancelled`;

      console.log('💳 Creating checkout session...');
      console.log('🎯 Success URL:', successUrl);
      console.log('❌ Cancel URL:', cancelUrl);

      await subscriptionService.createCheckoutSession(
        plan.id,
        successUrl,
        cancelUrl
      );

    } catch (err) {
      console.error('❌ Error selecting plan:', err);
      setError(`Error: ${err.message || 'Error processing plan. Please try again.'}`);
    } finally {
      setProcessingPlan(null);
    }
  };

  // Manage subscription
  const handleManageSubscription = async () => {
    try {
      console.log('🔧 Opening management portal...', currentSubscription);

      // If internal trial (no stripe_customer_id), show upgrade options
      if (currentSubscription && currentSubscription.status === 'trialing' && !currentSubscription.stripe_customer_id) {
        console.log('⚠️ Internal trial - showing upgrade options');
        setBillingCycle('monthly');
        setError('');
        document.querySelector('.plans-grid')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // For Stripe trials and paid subscriptions, open Customer Portal
      const returnUrl = `${window.location.origin}/subscription`;
      await subscriptionService.createCustomerPortalSession(returnUrl);
    } catch (err) {
      console.error('Error opening portal:', err);
      
      // Fallback: If failed and is trial, show upgrade options
      if (currentSubscription && currentSubscription.status === 'trialing') {
        console.log('⚠️ Portal failed for trial - showing upgrade options');
        setBillingCycle('monthly');
        setError('');
        document.querySelector('.plans-grid')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setError('Error opening management portal. Please try again.');
      }
    }
  };

  // Enhanced Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    }
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const slideInScale = {
    hidden: { opacity: 0, scale: 0.95, y: 40 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    }
  };

  if (loading) {
    return (
      <div className="subscription-page">
        <div className="loading-container">
          <Loader className="loading-spinner" size={48} />
          <p>Loading plans...</p>
        </div>
      </div>
    );
  }

  const { trial, monthly, yearly } = organizedPlans();

  return (
    <div className="subscription-page">
      <div className="container">
        {/* Header */}
        <motion.div 
          className="subscription-header"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="subscription-title"
            variants={fadeInUp}
          >
            Choose Your <span className="highlight">Perfect Plan</span>
          </motion.h1>
          <motion.p 
            className="subscription-subtitle"
            variants={fadeInUp}
          >
            Simple and transparent plans to automate your Facebook campaigns
          </motion.p>
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
                <h3>Current Plan: {currentSubscription.plan_name}</h3>
                <p>
                  Status: <span className={`status ${currentSubscription.status}`}>
                    {currentSubscription.status === 'trialing' ? 'Active Trial' : 
                     currentSubscription.status === 'active' ? 'Active' : currentSubscription.status}
                  </span>
                </p>
                {currentSubscription.trial_end && (
                  <p className="trial-info">
                    Trial until: {new Date(currentSubscription.trial_end).toLocaleDateString('en-US')}
                  </p>
                )}
              </div>
            </div>
            <button 
              className="btn btn-ghost"
              onClick={handleManageSubscription}
            >
              Manage Subscription
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
              <h2>Try for Free</h2>
              <p>10 days of full access, no credit card required</p>
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
                  Start Free Trial
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
            Monthly
          </button>
          <button
            className={`toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('yearly')}
          >
            Annual
            <span className="savings-badge">Save 3 months</span>
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
        {getFilteredPlans().map((plan, index) => {
          const isPopular = plan.name.includes('Standard');
          const isCurrentPlan = isPlanActive(plan);
          const canChange = canChangeToPlan(plan);
          const discount = billingCycle === 'yearly' ? calculateDiscount(plan) : null;
          const originalYearlyPrice = plan.billing_period === 'yearly' ? getOriginalYearlyPrice(plan) : null;

          return (
            <motion.div
              key={plan.id}
              className={`plan-card ${isPopular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}
              variants={index % 2 === 0 ? fadeInLeft : fadeInRight}
              whileHover={{ 
                y: -10,
                scale: canChange ? 1.02 : 1,
                transition: { duration: 0.3 }
              }}
            >
              {isPopular && <div className="popular-badge">Most Popular</div>}
              {isCurrentPlan && <div className="current-badge">Current Plan</div>}

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
                       plan.billing_period === 'monthly' ? '/month' : '/year'}
                    </span>
                  </div>
                  {discount && (
                    <div className="discount-info">
                      <strong style={{ color: '#10b981' }}>
                        Save {subscriptionService.formatPrice(discount.discount)} (3 months free)
                      </strong>
                    </div>
                  )}
                  {originalYearlyPrice && !discount && (
                    <div className="discount-info">
                      <strong style={{ color: '#10b981' }}>
                        3 months free included
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
                    Current Plan
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
                        {plan.billing_period === 'trial' ? 'Start Trial' : 'Choose Plan'}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                ) : (
                  <button className="btn btn-ghost btn-full" disabled>
                    Not Available
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
        <h2>Feature Comparison</h2>
        <div className="comparison-table">
          <div className="comparison-header">
            <div className="feature-name">Feature</div>
            <div className="plan-column">Basic</div>
            <div className="plan-column">Standard</div>
            <div className="plan-column">Expert</div>
          </div>
          
          {[
            { name: 'Daily ROAS Profit Sheet', basic: true, standard: true, expert: true },
            { name: 'Quotation', basic: true, standard: true, expert: true },
            { name: 'Campaigns', basic: false, standard: true, expert: true },
            { name: 'Product Research', basic: false, standard: false, expert: true },
            { name: 'Priority Support', basic: false, standard: true, expert: true },
            { name: 'Complete History', basic: false, standard: true, expert: true }
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
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Can I cancel at any time?</h4>
            <p>Yes! There's no commitment. You can cancel whenever you want and continue using until the end of the paid period.</p>
          </div>
          <div className="faq-item">
            <h4>How does the free trial work?</h4>
            <p>10 days completely free with access to all features. No credit card required.</p>
          </div>
          <div className="faq-item">
            <h4>Can I change my plan?</h4>
            <p>Of course! You can upgrade or downgrade at any time through the management portal.</p>
          </div>
          <div className="faq-item">
            <h4>What payment methods do you accept?</h4>
            <p>Credit/debit card, PayPal, and other payment methods through Stripe.</p>
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
              <h3>Trial Activated Successfully!</h3>
              <p>You have 10 days of full access to all features.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowTrialModal(false);
                  navigation.toDashboard();
                }}
              >
                Go to Dashboard
              </button>
              <button 
                className="btn btn-ghost"
                onClick={() => setShowTrialModal(false)}
              >
                Stay Here
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
};

export default SubscriptionPage;
