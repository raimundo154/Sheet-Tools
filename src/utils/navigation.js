// Sistema de navegação centralizado
// Este arquivo gerencia todas as rotas e redirecionamentos da aplicação

export const ROUTES = {
  // Páginas públicas (sem autenticação)
  HOME: '/',                    // Página inicial/landing (NewHomePage)
  LOGIN: '/login',              // Página de login (LoginPage)
  SIGNUP: '/signup',            // Página de cadastro (SignupPage)
  VERIFY_EMAIL: '/verify-email', // Verificação de email (EmailVerification)
  SUBSCRIPTION: '/subscription', // Página de planos e subscription
  
  // Callbacks de autenticação
  AUTH_CALLBACK: '/auth/callback', // Callback do Google/Supabase
  
  // Páginas da aplicação (com autenticação)
  DASHBOARD: '/dashboard',      // Dashboard principal (HomePage)
  CAMPAIGNS: '/campaigns',      // Gestão de campanhas (CampaignDashboard)
  SALES: '/sales',              // Redirecionado para QuotationPage
  QUOTATION: '/quotation',      // Cotação de moedas (QuotationPage)
  DAILY_ROAS: '/daily-roas',    // Análise diária de ROAS (DailyRoasPage)
  PROFIT_SHEET: '/profit-sheet', // Folha de lucros (ProfitSheet)
  PRODUCT_RESEARCH: '/product-research', // Pesquisa de produtos (ProductResearch)
  RANK_UP: '/rank-up',          // Rank Up (placeholder)
  SETTINGS: '/settings',        // Configurações da conta (SettingsPage)
  
  // Páginas legais
  PRIVACY: '/privacy',          // Política de privacidade
  TERMS: '/terms',             // Termos de serviço
};

export const PAGE_NAMES = {
  [ROUTES.HOME]: 'home-landing',
  [ROUTES.LOGIN]: 'login',
  [ROUTES.SIGNUP]: 'signup',
  [ROUTES.VERIFY_EMAIL]: 'verify-email',
  [ROUTES.SUBSCRIPTION]: 'subscription',
  [ROUTES.AUTH_CALLBACK]: 'auth-callback',
  [ROUTES.DASHBOARD]: 'dashboard',
  [ROUTES.CAMPAIGNS]: 'campaigns',
  [ROUTES.SALES]: 'sales',
  [ROUTES.QUOTATION]: 'quotation',
  [ROUTES.DAILY_ROAS]: 'daily-roas',
  [ROUTES.PROFIT_SHEET]: 'profit-sheet',
  [ROUTES.PRODUCT_RESEARCH]: 'product-research',
  [ROUTES.RANK_UP]: 'rank-up',
  [ROUTES.SETTINGS]: 'settings',
  [ROUTES.PRIVACY]: 'privacy',
  [ROUTES.TERMS]: 'terms',
};

// Utilitário para navegação
class NavigationService {
  
  /**
   * Navegar para uma rota específica
   * @param {string} route - Rota de destino
   * @param {boolean} replace - Se deve substituir o histórico (default: false)
   */
  static navigate(route, replace = false) {
    if (replace) {
      window.history.replaceState({}, '', route);
    } else {
      window.history.pushState({}, '', route);
    }
    
    // Disparar evento customizado para que o App.js possa reagir
    window.dispatchEvent(new CustomEvent('navigation', { 
      detail: { route, replace } 
    }));
  }

  /**
   * Recarregar a página atual
   */
  static reload() {
    window.location.reload();
  }

  /**
   * Redirecionamento completo (recarrega a página)
   * @param {string} route - Rota de destino
   */
  static redirect(route) {
    window.location.href = route;
  }

  /**
   * Obter a rota atual
   */
  static getCurrentRoute() {
    return window.location.pathname;
  }

  /**
   * Obter o nome da página atual baseado na rota
   */
  static getCurrentPageName() {
    const currentRoute = this.getCurrentRoute();
    return PAGE_NAMES[currentRoute] || 'home-landing';
  }

  /**
   * Verificar se a rota atual requer autenticação
   */
  static requiresAuth(route = null) {
    const checkRoute = route || this.getCurrentRoute();
    const authRequiredRoutes = [
      ROUTES.DASHBOARD, 
      ROUTES.CAMPAIGNS, 
      ROUTES.SALES, 
      ROUTES.QUOTATION, 
      ROUTES.DAILY_ROAS,
      ROUTES.PROFIT_SHEET,
      ROUTES.PRODUCT_RESEARCH,
      ROUTES.RANK_UP,
      ROUTES.SETTINGS
    ];
    return authRequiredRoutes.includes(checkRoute);
  }

  /**
   * Verificar se a rota atual é de autenticação
   */
  static isAuthRoute(route = null) {
    const checkRoute = route || this.getCurrentRoute();
    const authRoutes = [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.VERIFY_EMAIL, ROUTES.AUTH_CALLBACK];
    return authRoutes.includes(checkRoute);
  }

  /**
   * Verificar se a rota atual é a página inicial
   */
  static isHomePage(route = null) {
    const checkRoute = route || this.getCurrentRoute();
    return checkRoute === ROUTES.HOME;
  }
}

// Funções de conveniência para navegação comum
export const navigation = {
  // Navegação para páginas principais
  toHome: () => NavigationService.navigate(ROUTES.HOME),
  toLogin: () => NavigationService.navigate(ROUTES.LOGIN),
  toSignup: () => NavigationService.navigate(ROUTES.SIGNUP),
  toVerifyEmail: () => NavigationService.navigate(ROUTES.VERIFY_EMAIL),
  toSubscription: () => NavigationService.navigate(ROUTES.SUBSCRIPTION),
  toDashboard: () => NavigationService.navigate(ROUTES.DASHBOARD),
  toCampaigns: () => NavigationService.navigate(ROUTES.CAMPAIGNS),
  toSales: () => NavigationService.navigate(ROUTES.SALES),
  toQuotation: () => NavigationService.navigate(ROUTES.QUOTATION),
  toDailyRoas: () => NavigationService.navigate(ROUTES.DAILY_ROAS),
  toProfitSheet: () => NavigationService.navigate(ROUTES.PROFIT_SHEET),
  toProductResearch: () => NavigationService.navigate(ROUTES.PRODUCT_RESEARCH),
  toRankUp: () => NavigationService.navigate(ROUTES.RANK_UP),
  toSettings: () => NavigationService.navigate(ROUTES.SETTINGS),
  
  // Navegação para páginas legais
  toPrivacy: () => NavigationService.navigate(ROUTES.PRIVACY),
  toTerms: () => NavigationService.navigate(ROUTES.TERMS),
  
  // Redirecionamentos especiais
  redirectAfterLogin: () => NavigationService.navigate(ROUTES.DASHBOARD, true),
  redirectAfterLogout: () => NavigationService.navigate(ROUTES.HOME, true),
  redirectAfterSignup: () => NavigationService.navigate(ROUTES.VERIFY_EMAIL),
  redirectAfterVerification: () => NavigationService.navigate(ROUTES.DASHBOARD, true),
  
  // Utilitários
  getCurrentRoute: () => NavigationService.getCurrentRoute(),
  getCurrentPageName: () => NavigationService.getCurrentPageName(),
  requiresAuth: (route) => NavigationService.requiresAuth(route),
  isAuthRoute: (route) => NavigationService.isAuthRoute(route),
  isHomePage: (route) => NavigationService.isHomePage(route),
};

export default NavigationService;
