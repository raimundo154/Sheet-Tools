// Serviço para gerenciar usuários multi-tenant
// Cada usuário tem seus próprios dados isolados

class UserService {
  constructor() {
    this.currentUser = null;
  }

  // Gerar ID único para usuário baseado no Facebook User ID
  generateUserId(facebookUserId) {
    return `user_${facebookUserId}`;
  }

  // Definir usuário atual (após login)
  setCurrentUser(userInfo, accessToken) {
    const userId = this.generateUserId(userInfo.id);
    
    this.currentUser = {
      id: userId,
      facebookId: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
      accessToken: accessToken,
      connectedAt: new Date().toISOString()
    };

    // Salvar no localStorage
    localStorage.setItem('current_user', JSON.stringify(this.currentUser));
    
    return this.currentUser;
  }

  // Obter usuário atual
  getCurrentUser() {
    if (!this.currentUser) {
      const savedUser = localStorage.getItem('current_user');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
    }
    return this.currentUser;
  }

  // Verificar se usuário está logado
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  }

  // Fazer logout
  logout() {
    this.currentUser = null;
    localStorage.removeItem('current_user');
    
    // Limpar dados específicos do usuário
    this.clearUserData();
  }

  // Obter chave única para dados do usuário
  getUserDataKey(dataType) {
    const user = this.getCurrentUser();
    if (!user) return null;
    
    return `${user.id}_${dataType}`;
  }

  // Salvar dados específicos do usuário
  saveUserData(dataType, data) {
    const key = this.getUserDataKey(dataType);
    if (key) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  // Obter dados específicos do usuário
  getUserData(dataType) {
    const key = this.getUserDataKey(dataType);
    if (!key) return null;
    
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  // Limpar todos os dados do usuário atual
  clearUserData() {
    const user = this.getCurrentUser();
    if (!user) return;

    // Lista de tipos de dados para limpar
    const dataTypes = ['campaigns', 'ad_accounts', 'connection_data'];
    
    dataTypes.forEach(dataType => {
      const key = `${user.id}_${dataType}`;
      localStorage.removeItem(key);
    });
  }

  // Migrar dados globais para dados do usuário (para usuários existentes)
  migrateGlobalData() {
    const user = this.getCurrentUser();
    if (!user) return;

    // Migrar campanhas globais para o usuário atual
    const globalCampaigns = localStorage.getItem('campaigns');
    if (globalCampaigns && !this.getUserData('campaigns')) {
      this.saveUserData('campaigns', JSON.parse(globalCampaigns));
      localStorage.removeItem('campaigns'); // Limpar dados globais
    }

    // Migrar conexão Meta global
    const globalConnection = localStorage.getItem('meta_connection');
    if (globalConnection && !this.getUserData('connection_data')) {
      this.saveUserData('connection_data', JSON.parse(globalConnection));
      localStorage.removeItem('meta_connection'); // Limpar dados globais
    }
  }

  // Obter estatísticas do usuário
  getUserStats() {
    const campaigns = this.getUserData('campaigns') || [];
    const connectionData = this.getUserData('connection_data');
    
    return {
      totalCampaigns: campaigns.length,
      connectedAccounts: connectionData?.adAccounts?.length || 0,
      lastConnection: connectionData?.connectedAt || null
    };
  }

  // Listar todos os usuários (para admin/debug)
  getAllUsers() {
    const users = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('user_') && key.endsWith('_connection_data')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const userId = key.split('_connection_data')[0];
          users.push({
            id: userId,
            name: data.userInfo?.name || 'Unknown',
            connectedAt: data.connectedAt,
            adAccounts: data.adAccounts?.length || 0
          });
        } catch (e) {
          // Ignorar dados corrompidos
        }
      }
    });
    
    return users;
  }
}

// Instância singleton
const userService = new UserService();

export default userService;