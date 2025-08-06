// Configurações de ambiente para a aplicação

const environment = {
  // Detectar ambiente automaticamente
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Facebook App ID
  facebookAppId: process.env.REACT_APP_FACEBOOK_APP_ID || '1525902928789947',
  
  // URLs baseadas no ambiente
  getCallbackUrl: () => {
    if (environment.isDevelopment) {
      return 'http://localhost:3000/meta-callback';
    }
    return `${window.location.origin}/meta-callback`;
  },
  
  // URLs da API do Facebook
  facebook: {
    graphApiUrl: 'https://graph.facebook.com',
    oauthUrl: 'https://www.facebook.com/v16.0/dialog/oauth',
    version: 'v16.0'
  },
  
  // Configurações de desenvolvimento
  development: {
    enableDebugLogs: true,
    mockApiCalls: false
  },
  
  // Configurações de produção
  production: {
    enableDebugLogs: false,
    mockApiCalls: false
  },
  
  // Obter configurações do ambiente atual
  getCurrentConfig: () => {
    return environment.isDevelopment 
      ? environment.development 
      : environment.production;
  }
};

export default environment;