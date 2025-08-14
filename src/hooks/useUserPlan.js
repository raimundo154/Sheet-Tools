import { useState, useEffect, useCallback } from 'react';
import subscriptionService from '../services/subscriptionService';
import authService from '../services/authService';

// Hook para gerenciar plano do usuário e permissões
export const useUserPlan = () => {
  const [userPlan, setUserPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUserPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = authService.getCurrentUser();
      console.log('🔍 useUserPlan - User from authService:', user);
      
      if (!user) {
        console.log('❌ useUserPlan - Nenhum user encontrado, definindo userPlan como null');
        setUserPlan(null);
        return;
      }

      console.log('✅ useUserPlan - User encontrado, buscando subscription...');
      const subscription = await subscriptionService.getUserActiveSubscription();
      console.log('📦 useUserPlan - Subscription encontrada:', subscription);
      setUserPlan(subscription);
    } catch (err) {
      console.error('❌ useUserPlan - Erro ao carregar plano do usuário:', err);
      setError(err.message);
      setUserPlan(null);
    } finally {
      setLoading(false);
      console.log('🏁 useUserPlan - Loading finalizado');
    }
  }, []);

  useEffect(() => {
    loadUserPlan();
    
    // Escutar mudanças na autenticação
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      console.log('🔄 useUserPlan - Auth state mudou:', event, session?.user?.email);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setTimeout(() => loadUserPlan(), 100); // Pequeno delay para garantir que authService.user está atualizado
      }
    });

    // Detectar retorno da página de pagamento
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Página tornou-se visível - verificar se há success query param
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('subscription') === 'success') {
          console.log('🎉 useUserPlan - Retorno do pagamento detectado, recarregando subscription...');
          setTimeout(() => {
            loadUserPlan();
            // Limpar query param
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          }, 2000); // Delay para webhook processar
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription?.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadUserPlan]);

  const refreshUserPlan = () => {
    loadUserPlan();
  };

  // Verificar se usuário tem plano ativo
  const hasActivePlan = userPlan && ['active', 'trialing'].includes(userPlan.status);

  // Verificar se usuário tem acesso a uma página específica
  const hasPageAccess = (pageName) => {
    if (!hasActivePlan) {
      // Páginas que todos podem acessar sem plano
      const publicPages = ['dashboard', 'subscription', 'rank-up', 'settings'];
      return publicPages.includes(pageName);
    }

    // Com plano ativo, verificar features do plano
    const planFeatures = userPlan.features || [];
    
    const pageFeatureMap = {
      'daily-roas': 'Daily ROAS Profit Sheet',
      'profit-sheet': 'Daily ROAS Profit Sheet',
      'quotation': 'Quotation',
      'campaigns': 'Campaigns',
      'product-research': 'Product Research'
    };

    const requiredFeature = pageFeatureMap[pageName];
    if (!requiredFeature) {
      // Páginas que não requerem features específicas
      return true;
    }

    return planFeatures.includes(requiredFeature);
  };

  // Obter páginas disponíveis para o sidebar
  const getAvailablePages = () => {
    const allPages = [
      { id: 'dashboard', name: 'Dashboard', icon: 'Home', alwaysVisible: true },
      { id: 'daily-roas', name: 'Daily ROAS', icon: 'TrendingUp', feature: 'Daily ROAS Profit Sheet' },
      { id: 'quotation', name: 'Quotation', icon: 'DollarSign', feature: 'Quotation' },
      { id: 'campaigns', name: 'Campaigns', icon: 'Target', feature: 'Campaigns' },
      { id: 'product-research', name: 'Product Research', icon: 'Search', feature: 'Product Research' },
      { id: 'subscription', name: 'Subscription', icon: 'Crown', alwaysVisible: true }
    ];

    return allPages.filter(page => {
      if (page.alwaysVisible) return true;
      if (!hasActivePlan) return false;
      
      const planFeatures = userPlan.features || [];
      return planFeatures.includes(page.feature);
    });
  };

  // Obter informações do plano atual
  const getPlanInfo = () => {
    if (!hasActivePlan) {
      return {
        name: 'Sem Plano',
        type: 'none',
        status: 'inactive',
        features: []
      };
    }

    return {
      name: userPlan.plan_name,
      type: getPlanType(userPlan.plan_name),
      status: userPlan.status,
      features: userPlan.features || [],
      trialEnd: userPlan.trial_end,
      periodEnd: userPlan.current_period_end
    };
  };

  // Determinar tipo do plano
  const getPlanType = (planName) => {
    if (planName?.toLowerCase().includes('basic')) return 'basic';
    if (planName?.toLowerCase().includes('standard')) return 'standard';
    if (planName?.toLowerCase().includes('expert')) return 'expert';
    if (planName?.toLowerCase().includes('trial')) return 'trial';
    return 'none';
  };

  return {
    userPlan,
    loading,
    error,
    refreshUserPlan,
    hasActivePlan,
    hasPageAccess,
    getAvailablePages,
    getPlanInfo,
    planType: getPlanType(userPlan?.plan_name),
    isBasic: getPlanType(userPlan?.plan_name) === 'basic',
    isStandard: getPlanType(userPlan?.plan_name) === 'standard',
    isExpert: getPlanType(userPlan?.plan_name) === 'expert',
    isTrial: userPlan?.status === 'trialing'
  };
};

export default useUserPlan;
