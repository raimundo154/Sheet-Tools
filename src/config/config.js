// Configurações da aplicação
// Mude apenas as URLs quando fizer deploy

const config = {
  // Ambiente atual
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // URLs base
  baseUrl: process.env.REACT_APP_BASE_URL || (
    process.env.NODE_ENV === 'production' 
      ? 'https://seudominio.pt'  // ← MUDE AQUI quando comprar domínio
      : 'http://localhost:3002'
  ),
  
  // Facebook App
  facebookAppId: process.env.REACT_APP_FACEBOOK_APP_ID || '1525902928789947',
  
  // URLs específicas
  get callbackUrl() {
    return `${this.baseUrl}/meta-callback`;
  },
  
  get apiUrl() {
    return `${this.baseUrl}/api`;
  },
  
  // Configurações Facebook OAuth
  facebook: {
    version: 'v16.0',
    scope: [
      'ads_management',
      'ads_read', 
      'business_management',
      'page_events',
      'pages_manage_ads',
      'pages_manage_cta',
      'pages_read_engagement',
      'pages_show_list'
    ].join(','),
    
    // URLs Facebook
    get loginUrl() {
      return `https://www.facebook.com/${this.version}/dialog/oauth`;
    },
    
    get graphUrl() {
      return `https://graph.facebook.com/${this.version}`;
    }
  },
  
  // Configurações da aplicação
  app: {
    name: 'Campaign Manager Pro',
    description: 'Gestão inteligente de campanhas Facebook Ads',
    version: '1.0.0'
  },
  
  // Configurações de desenvolvimento
  dev: {
    showDebugInfo: process.env.NODE_ENV === 'development',
    enableConsoleLog: process.env.NODE_ENV === 'development'
  }
};

export default config;