import { useState, useEffect, useCallback } from 'react';
import subscriptionService from '../services/subscriptionService';
import authService from '../services/authService';

// Hook para gerenciar subscription do usuário
export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = authService.getCurrentUser();
      if (!user) {
        setSubscription(null);
        return;
      }

      const subscriptionData = await subscriptionService.getUserActiveSubscription();
      setSubscription(subscriptionData);
    } catch (err) {
      console.error('Erro ao carregar subscription:', err);
      setError(err.message);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = () => {
    loadSubscription();
  };

  return {
    subscription,
    loading,
    error,
    refreshSubscription,
    isActive: subscription?.status === 'active',
    isTrialing: subscription?.status === 'trialing',
    hasActiveSubscription: ['active', 'trialing'].includes(subscription?.status)
  };
};

// Hook para verificar se usuário tem acesso a uma feature específica
export const useFeatureAccess = (featureName) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const { subscription, hasActiveSubscription } = useSubscription();

  const checkFeatureAccess = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!hasActiveSubscription) {
        setHasAccess(false);
        return;
      }

      // Verificar na base de dados
      const access = await subscriptionService.userHasFeature(featureName);
      setHasAccess(access);
    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }, [featureName, hasActiveSubscription]);

  useEffect(() => {
    checkFeatureAccess();
  }, [checkFeatureAccess]);

  return {
    hasAccess,
    loading,
    subscription,
    hasActiveSubscription
  };
};

// Mapeamento de features por funcionalidade da aplicação
export const FEATURES = {
  DAILY_ROAS: 'Daily ROAS Profit Sheet',
  QUOTATION: 'Quotation', 
  CAMPAIGNS: 'Campaigns',
  PRODUCT_RESEARCH: 'Product Research'
};

// Hook específico para cada funcionalidade da aplicação
export const useDailyRoasAccess = () => useFeatureAccess(FEATURES.DAILY_ROAS);
export const useQuotationAccess = () => useFeatureAccess(FEATURES.QUOTATION);
export const useCampaignsAccess = () => useFeatureAccess(FEATURES.CAMPAIGNS);
export const useProductResearchAccess = () => useFeatureAccess(FEATURES.PRODUCT_RESEARCH);

export default useSubscription;
