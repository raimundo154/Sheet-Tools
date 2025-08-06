import React, { useState, useEffect } from 'react';
import { Link, Settings, RefreshCw, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import facebookApi from '../services/facebookApi';

const FacebookApiIntegration = ({ onCampaignsSync }) => {
  const [apiConfig, setApiConfig] = useState({
    accessToken: '',
    adAccountId: ''
  });
  
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error
  const [accountInfo, setAccountInfo] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState(null);

  // Carregar configuração e conectar automaticamente
  useEffect(() => {
    const savedConfig = localStorage.getItem('facebook_api_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setApiConfig(config);
      
      if (config.accessToken && config.adAccountId) {
        validateConnection(config);
      }
    } else {
      // Se não há config salva, usar as credenciais padrão
      if (apiConfig.accessToken && apiConfig.adAccountId) {
        validateConnection(apiConfig);
      }
    }
  }, []);

  const validateConnection = async (config) => {
    setConnectionStatus('connecting');
    setError('');
    
    try {
      // Configurar credenciais na API
      facebookApi.setCredentials(config.accessToken, config.adAccountId);
      
      // Testar conexão buscando informações da conta
      const accountData = await facebookApi.getAccountInfo();
      
      setAccountInfo(accountData);
      setConnectionStatus('connected');
      
      // Salvar configuração
      localStorage.setItem('facebook_api_config', JSON.stringify(config));
      
      // Buscar campanhas automaticamente
      await fetchCampaigns(config);
      
    } catch (err) {
      console.error('Erro de conexão:', err);
      setError(err.message);
      setConnectionStatus('error');
    }
  };

  const fetchCampaigns = async (config = apiConfig) => {
    setIsLoading(true);
    try {
      // Configurar credenciais se necessário
      if (config.accessToken && config.adAccountId) {
        facebookApi.setCredentials(config.accessToken, config.adAccountId);
      }
      
      // Buscar campanhas reais do Facebook
      const campaignsResponse = await facebookApi.getCampaigns();
      const campaignsList = campaignsResponse.data || [];
      
      console.log('Campanhas encontradas:', campaignsList.length);
      
      // Para cada campanha, buscar insights dos últimos 7 dias
      const campaignsWithInsights = await Promise.all(
        campaignsList.map(async (campaign) => {
          try {
            const insightsResponse = await facebookApi.getCampaignInsights(campaign.id, 'last_7d');
            const insights = insightsResponse.data && insightsResponse.data.length > 0 
              ? insightsResponse.data[0] 
              : {};
            
            return {
              ...campaign,
              insights
            };
          } catch (err) {
            console.error(`Erro ao buscar insights para campanha ${campaign.id}:`, err);
            return {
              ...campaign,
              insights: {}
            };
          }
        })
      );
      
      setCampaigns(campaignsWithInsights);
      setLastSync(new Date());
      
    } catch (err) {
      console.error('Erro ao buscar campanhas:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!apiConfig.accessToken || !apiConfig.adAccountId) {
      setError('Por favor, preencha o Access Token e ID da Conta de Anúncios');
      return;
    }
    
    await validateConnection(apiConfig);
  };

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
    setAccountInfo(null);
    setCampaigns([]);
    setApiConfig({ ...apiConfig, accessToken: '', adAccountId: '' });
    localStorage.removeItem('facebook_api_config');
  };

  const handleSyncCampaigns = async () => {
    if (connectionStatus === 'connected') {
      await fetchCampaigns();
    }
  };

  const convertFacebookCampaignToLocal = (fbCampaign) => {
    return facebookApi.convertCampaignToLocal(fbCampaign, fbCampaign.insights);
  };

  const handleImportCampaigns = () => {
    const convertedCampaigns = campaigns.map(convertFacebookCampaignToLocal);
    onCampaignsSync(convertedCampaigns);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Link className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Integração Facebook Ads</h2>
            <p className="text-sm text-gray-600">
              Conecte sua conta do Facebook Ads Manager para sincronizar campanhas automaticamente
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {connectionStatus === 'connected' && (
            <div className="flex items-center text-green-600">
              <CheckCircle size={16} className="mr-1" />
              <span className="text-sm">Conectado</span>
            </div>
          )}
          {connectionStatus === 'error' && (
            <div className="flex items-center text-red-600">
              <AlertCircle size={16} className="mr-1" />
              <span className="text-sm">Erro</span>
            </div>
          )}
        </div>
      </div>

      {/* Configuração da API */}
      {connectionStatus !== 'connected' && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-800 mb-3">Configuração da API</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token do Facebook *
              </label>
              <input
                type="password"
                value={apiConfig.accessToken}
                onChange={(e) => setApiConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                className="input"
                placeholder="EAAG..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Obtenha em: Facebook Developer Console → Graph API Explorer
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID da Conta de Anúncios *
              </label>
              <input
                type="text"
                value={apiConfig.adAccountId}
                onChange={(e) => setApiConfig(prev => ({ ...prev, adAccountId: e.target.value }))}
                className="input"
                placeholder="123456789012345"
              />
              <p className="text-xs text-gray-500 mt-1">
                Encontre em: Facebook Ads Manager → Configurações da Conta
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <a
              href="https://developers.facebook.com/tools/explorer/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm flex items-center hover:underline"
            >
              <ExternalLink size={14} className="mr-1" />
              Como obter Access Token
            </a>
            
            <button
              onClick={handleConnect}
              disabled={connectionStatus === 'connecting'}
              className="btn btn-primary"
            >
              {connectionStatus === 'connecting' ? (
                <>
                  <RefreshCw size={16} className="animate-spin mr-2" />
                  Conectando...
                </>
              ) : (
                <>
                  <Link size={16} className="mr-2" />
                  Conectar
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Informações da Conta */}
      {accountInfo && (
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-green-800 mb-2">Conta Conectada</h3>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>Nome:</strong> {accountInfo.name}</p>
            <p><strong>Moeda:</strong> {accountInfo.currency}</p>
            <p><strong>Status:</strong> {accountInfo.account_status === 1 ? 'Ativa' : 'Inativa'}</p>
            <p><strong>Gasto Total:</strong> {accountInfo.currency} {parseFloat(accountInfo.amount_spent || 0).toFixed(2)}</p>
          </div>
          
          <div className="flex justify-between items-center mt-3">
            <div className="text-xs text-green-600">
              {lastSync && `Última sincronização: ${lastSync.toLocaleString('pt-PT')}`}
            </div>
            <button
              onClick={handleDisconnect}
              className="text-red-600 text-sm hover:underline"
            >
              Desconectar
            </button>
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <div className="flex items-center text-red-800">
            <AlertCircle size={16} className="mr-2" />
            <span className="font-medium">Erro:</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Lista de Campanhas */}
      {connectionStatus === 'connected' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">
              Campanhas do Facebook ({campaigns.length})
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={handleSyncCampaigns}
                disabled={isLoading}
                className="btn btn-secondary"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin mr-2" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} className="mr-2" />
                    Atualizar
                  </>
                )}
              </button>
              
              {campaigns.length > 0 && (
                <button
                  onClick={handleImportCampaigns}
                  className="btn btn-primary"
                >
                  Importar Campanhas
                </button>
              )}
            </div>
          </div>
          
          {campaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome da Campanha</th>
                    <th>Status</th>
                    <th>Objetivo</th>
                    <th>Gasto (7d)</th>
                    <th>Impressões</th>
                    <th>Cliques</th>
                    <th>CPC</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => {
                    const insights = campaign.insights || {};
                    return (
                      <tr key={campaign.id}>
                        <td>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-xs text-gray-500">ID: {campaign.id}</div>
                        </td>
                        <td>
                          <span className={`badge ${campaign.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td>{campaign.objective}</td>
                        <td>€{parseFloat(insights.spend || 0).toFixed(2)}</td>
                        <td>{parseInt(insights.impressions || 0).toLocaleString()}</td>
                        <td>{parseInt(insights.clicks || 0).toLocaleString()}</td>
                        <td>€{parseFloat(insights.cpc || 0).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Settings size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Nenhuma campanha encontrada</p>
              <p className="text-sm">Verifique se possui campanhas ativas no Facebook Ads Manager</p>
            </div>
          )}
        </div>
      )}
      
      {/* Instruções */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Como usar:</h4>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Obtenha um Access Token no Facebook Developer Console</li>
          <li>Encontre o ID da sua conta de anúncios no Facebook Ads Manager</li>
          <li>Conecte sua conta usando as credenciais acima</li>
          <li>Suas campanhas serão sincronizadas automaticamente</li>
          <li>Importe as campanhas para começar a usar as regras automáticas</li>
        </ol>
        
        <div className="mt-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
          <p className="text-yellow-800 text-sm">
            <strong>Nota:</strong> Após importar, você precisará configurar o preço do produto e COGS 
            para cada campanha para que as regras de decisão automática funcionem corretamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FacebookApiIntegration;