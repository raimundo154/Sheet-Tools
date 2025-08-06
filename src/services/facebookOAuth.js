// Facebook OAuth Integration Service
// Permite múltiplos usuários conectarem suas contas Facebook Ads

class FacebookOAuthService {
  constructor() {
    // Configurações da App Facebook
    this.appId = process.env.REACT_APP_FACEBOOK_APP_ID || null; 
    this.redirectUri = window.location.origin + '/meta-callback';
    this.scope = [
      'ads_management',
      'ads_read', 
      'business_management',
      'pages_manage_ads',
      'pages_read_engagement'
    ].join(',');
    
    // Verificar se App ID está configurado
    if (!this.appId || this.appId === 'YOUR_FACEBOOK_APP_ID') {
      console.warn('Facebook App ID não configurado. Usando modo demonstração.');
      this.demoMode = true;
    } else {
      this.demoMode = false;
    }
  }

  // Gerar URL de login do Facebook
  generateLoginUrl() {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      response_type: 'code',
      display: 'popup',
      auth_type: 'rerequest'
    });

    return `https://www.facebook.com/v16.0/dialog/oauth?${params.toString()}`;
  }

  // Abrir popup de login
  openLoginPopup() {
    return new Promise((resolve, reject) => {
      // Verificar se está em modo demonstração
      if (this.demoMode) {
        // Simular processo de login para demonstração
        setTimeout(() => {
          const demoAuthData = {
            access_token: 'demo_token_' + Date.now(),
            expires_in: 3600,
            user_id: 'demo_user_' + Date.now(),
            accounts: [
              {
                id: 'act_demo_' + Date.now(),
                name: 'Conta Demo - ' + new Date().toLocaleString('pt-PT'),
                currency: 'EUR',
                account_status: 1
              }
            ]
          };
          resolve(demoAuthData);
        }, 1500); // Simular delay do Facebook
        return;
      }

      // Verificar se App ID está configurado
      if (!this.appId) {
        reject(new Error('Facebook App ID não configurado. Configure REACT_APP_FACEBOOK_APP_ID no arquivo .env'));
        return;
      }

      const loginUrl = this.generateLoginUrl();
      
      // Configurações do popup
      const popup = window.open(
        loginUrl,
        'facebook-login',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );

      // Verificar se popup foi bloqueado
      if (!popup) {
        reject(new Error('Popup foi bloqueado. Permita popups para este site.'));
        return;
      }

      // Monitorar popup
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('Login cancelado pelo usuário'));
        }
      }, 1000);

      // Listener para mensagens do popup
      const messageListener = (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'FACEBOOK_LOGIN_SUCCESS') {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener('message', messageListener);
          resolve(event.data.authData);
        }
        
        if (event.data.type === 'FACEBOOK_LOGIN_ERROR') {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener('message', messageListener);
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener('message', messageListener);
    });
  }

  // Processar callback do Facebook (executado no popup)
  handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      // Enviar erro para janela pai
      window.opener.postMessage({
        type: 'FACEBOOK_LOGIN_ERROR',
        error: `Erro no login: ${error}`
      }, window.location.origin);
      return;
    }

    if (code) {
      // Trocar código por access token
      this.exchangeCodeForToken(code)
        .then(authData => {
          // Enviar dados para janela pai
          window.opener.postMessage({
            type: 'FACEBOOK_LOGIN_SUCCESS',
            authData
          }, window.location.origin);
        })
        .catch(error => {
          window.opener.postMessage({
            type: 'FACEBOOK_LOGIN_ERROR',
            error: error.message
          }, window.location.origin);
        });
    }
  }

  // Trocar código por access token usando Netlify Function
  async exchangeCodeForToken(code) {
    // IMPORTANTE: Esta operação é feita na Netlify Function por segurança
    // O app secret nunca deve estar no frontend
    
    try {
      // Chamada para Netlify Function
      const response = await fetch('/.netlify/functions/facebook-exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirect_uri: this.redirectUri
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao trocar código por token');
      }

      const data = await response.json();
      
      // Verificar se recebemos os dados necessários
      if (!data.access_token) {
        throw new Error('Token de acesso não recebido');
      }
      
      return data;
      
    } catch (error) {
      console.error('Erro na troca do token:', error);
      throw new Error('Erro ao trocar código por token: ' + error.message);
    }
  }

  // Obter contas de anúncios do usuário
  async getUserAdAccounts(accessToken) {
    try {
      const response = await fetch(`https://graph.facebook.com/v16.0/me/adaccounts?fields=id,name,currency,account_status&access_token=${accessToken}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar contas de anúncios');
      }
      
      const data = await response.json();
      return data.data || [];
      
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      throw new Error('Erro ao buscar contas de anúncios: ' + error.message);
    }
  }

  // Salvar dados de autenticação
  saveAuthData(authData, selectedAccount) {
    const authInfo = {
      accessToken: authData.access_token,
      adAccountId: selectedAccount.id.replace('act_', ''),
      accountName: selectedAccount.name,
      currency: selectedAccount.currency,
      userId: authData.user_id,
      expiresAt: Date.now() + (authData.expires_in * 1000),
      connectedAt: new Date().toISOString()
    };

    localStorage.setItem('facebook_oauth_auth', JSON.stringify(authInfo));
    return authInfo;
  }

  // Verificar se está autenticado
  isAuthenticated() {
    const authData = this.getAuthData();
    if (!authData) return false;
    
    // Verificar se token expirou
    if (Date.now() > authData.expiresAt) {
      this.logout();
      return false;
    }
    
    return true;
  }

  // Obter dados de autenticação salvos
  getAuthData() {
    const authData = localStorage.getItem('facebook_oauth_auth');
    return authData ? JSON.parse(authData) : null;
  }

  // Fazer logout
  logout() {
    localStorage.removeItem('facebook_oauth_auth');
  }

  // Renovar token (se necessário)
  async refreshToken() {
    const authData = this.getAuthData();
    if (!authData) throw new Error('Não autenticado');

    // Implementar renovação de token se necessário
    // Por enquanto, pedir novo login
    throw new Error('Token expirado. Faça login novamente.');
  }
}

// Instância singleton
const facebookOAuth = new FacebookOAuthService();

export default facebookOAuth;