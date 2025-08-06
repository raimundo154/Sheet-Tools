// CORS Proxy para Facebook API
// Como o Facebook não permite requests diretos do browser devido ao CORS,
// vamos usar um proxy público ou implementar uma solução alternativa

const CORS_PROXIES = [
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?'
];

class CorsProxyService {
  constructor() {
    this.currentProxyIndex = 0;
  }

  getCurrentProxy() {
    return CORS_PROXIES[this.currentProxyIndex];
  }

  async makeProxiedRequest(url) {
    let lastError;
    
    // Tentar cada proxy disponível
    for (let i = 0; i < CORS_PROXIES.length; i++) {
      try {
        const proxy = CORS_PROXIES[i];
        const proxiedUrl = proxy + encodeURIComponent(url);
        
        console.log(`Tentando proxy ${i + 1}:`, proxy);
        
        const response = await fetch(proxiedUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        this.currentProxyIndex = i; // Usar este proxy para próximas requests
        return data;
        
      } catch (error) {
        console.warn(`Proxy ${i + 1} falhou:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    // Se todos os proxies falharam, tentar request direto (pode falhar por CORS)
    try {
      console.log('Tentando request direto...');
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('Request direto falhou:', error.message);
      throw new Error(`Todos os proxies falharam. Último erro: ${lastError?.message || error.message}`);
    }
  }
}

const corsProxy = new CorsProxyService();
export default corsProxy;