import React, { useState, useEffect } from 'react';
import { Link, RefreshCw, AlertCircle, CheckCircle, Building2 } from 'lucide-react';
import userService from '../services/userService';

const MetaConnector = ({ onConnectionSuccess }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [adAccounts, setAdAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [error, setError] = useState('');

  // Sua Facebook App - Sheet Tools
  const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || '1525902928789947';

  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = () => {
    // Verificar se usuário está logado
    if (userService.isLoggedIn()) {
      const user = userService.getCurrentUser();
      const connectionData = userService.getUserData('connection_data');
      
      if (connectionData) {
        setIsConnected(true);
        setUserInfo(user);
        setAdAccounts(connectionData.adAccounts || []);
        setSelectedAccounts(connectionData.selectedAccounts || []);
      }
    }
  };

  const handleConnectMeta = async () => {
    // Verificar se App ID está configurado
    if (!FACEBOOK_APP_ID || FACEBOOK_APP_ID === 'SEU_APP_ID_AQUI') {
      setError('Facebook App ID não configurado. Veja o arquivo CRIAR_FACEBOOK_APP.md para instruções.');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      // Construir URL igual ao TrackBee
      const redirectUri = `${window.location.origin}/meta-callback`;
      const scope = [
        'ads_management',
        'ads_read', 
        'business_management',
        'page_events',
        'pages_manage_ads',
        'pages_manage_cta',
        'pages_read_engagement',
        'pages_show_list'
      ].join(',');

      const facebookLoginUrl = `https://www.facebook.com/v23.0/dialog/oauth?` + new URLSearchParams({
        client_id: FACEBOOK_APP_ID,
        redirect_uri: redirectUri,
        scope: scope,
        response_type: 'code',
        display: 'popup',
        auth_type: 'rerequest'
      }).toString();

      // Abrir popup igual ao TrackBee
      const popup = window.open(
        facebookLoginUrl,
        'facebook-login',
        'width=600,height=700,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no'
      );

      if (!popup) {
        throw new Error('Popup bloqueado. Permita popups para este site.');
      }

      // Monitorar popup
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
          setError('Login cancelado pelo usuário');
        }
      }, 1000);

      // Listener para callback
      const messageListener = (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'META_LOGIN_SUCCESS') {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener('message', messageListener);
          handleLoginSuccess(event.data.authData);
        }
        
        if (event.data.type === 'META_LOGIN_ERROR') {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener('message', messageListener);
          setError(event.data.error);
          setIsConnecting(false);
        }
      };

      window.addEventListener('message', messageListener);

    } catch (err) {
      setError(err.message);
      setIsConnecting(false);
    }
  };

  const handleLoginSuccess = async (authData) => {
    try {
      // Buscar informações do usuário
      const userResponse = await fetch(`https://graph.facebook.com/me?access_token=${authData.access_token}`);
      const userData = await userResponse.json();

      // Definir usuário atual no sistema multi-tenant
      const currentUser = userService.setCurrentUser(userData, authData.access_token);

      // Buscar todas as ad accounts do Business Manager
      const accountsResponse = await fetch(
        `https://graph.facebook.com/me/adaccounts?fields=id,name,currency,account_status,business&access_token=${authData.access_token}`
      );
      const accountsData = await accountsResponse.json();

      const connectionData = {
        accessToken: authData.access_token,
        userInfo: currentUser,
        adAccounts: accountsData.data || [],
        connectedAt: new Date().toISOString(),
        selectedAccounts: []
      };

      // Salvar dados específicos do usuário
      userService.saveUserData('connection_data', connectionData);
      
      // Migrar dados globais se existirem (para usuários existentes)
      userService.migrateGlobalData();
      
      setIsConnected(true);
      setUserInfo(currentUser);
      setAdAccounts(connectionData.adAccounts);
      setIsConnecting(false);

      // Notificar componente pai
      if (onConnectionSuccess) {
        onConnectionSuccess(connectionData);
      }

    } catch (err) {
      setError('Erro ao buscar dados do Facebook: ' + err.message);
      setIsConnecting(false);
    }
  };

  const handleAccountToggle = (accountId) => {
    setSelectedAccounts(prev => {
      const newSelected = prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId];
      
      // Atualizar dados do usuário
      const connectionData = userService.getUserData('connection_data') || {};
      connectionData.selectedAccounts = newSelected;
      userService.saveUserData('connection_data', connectionData);
      
      return newSelected;
    });
  };

  const handleImportCampaigns = async () => {
    if (selectedAccounts.length === 0) {
      setError('Selecione pelo menos uma ad account para importar campanhas');
      return;
    }

    setIsConnecting(true);
    try {
      const connectionData = userService.getUserData('connection_data');
      const accessToken = connectionData.accessToken;
      
      let allCampaigns = [];

      // Buscar campanhas de cada ad account selecionada
      for (const accountId of selectedAccounts) {
        try {
          const campaignsResponse = await fetch(
            `https://graph.facebook.com/${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,created_time&access_token=${accessToken}`
          );
          const campaignsData = await campaignsResponse.json();
          
          if (campaignsData.data) {
            // Buscar insights para cada campanha
            const campaignsWithInsights = await Promise.all(
              campaignsData.data.map(async (campaign) => {
                try {
                  const insightsResponse = await fetch(
                    `https://graph.facebook.com/${campaign.id}/insights?fields=spend,impressions,clicks,actions,cpc,cpm,ctr&date_preset=last_7d&access_token=${accessToken}`
                  );
                  const insightsData = await insightsResponse.json();
                  
                  const insights = insightsData.data && insightsData.data.length > 0 
                    ? insightsData.data[0] 
                    : {};

                  // Converter para formato da plataforma
                  return {
                    id: `fb_${campaign.id}`,
                    facebookCampaignId: campaign.id,
                    name: campaign.name,
                    adAccountId: accountId,
                    status: campaign.status,
                    objective: campaign.objective,
                    marketType: 'low_cpc', // Usuário pode ajustar depois
                    productName: campaign.name,
                    productPrice: 50, // Usuário deve configurar
                    cogs: 20, // Usuário deve configurar
                    currentBudget: parseFloat(campaign.daily_budget || campaign.lifetime_budget || 0) / 100,
                    initialBudget: 50,
                    createdAt: campaign.created_time,
                    dailyData: insights.spend ? [{
                      day: 1,
                      spend: parseFloat(insights.spend || 0),
                      sales: 0, // Será calculado baseado em actions
                      atc: 0,
                      clicks: parseInt(insights.clicks || 0),
                      impressions: parseInt(insights.impressions || 0),
                      unitsSold: 0
                    }] : []
                  };
                } catch (err) {
                  console.error(`Erro ao buscar insights para campanha ${campaign.id}:`, err);
                  return {
                    id: `fb_${campaign.id}`,
                    facebookCampaignId: campaign.id,
                    name: campaign.name,
                    adAccountId: accountId,
                    status: campaign.status,
                    marketType: 'low_cpc',
                    productName: campaign.name,
                    productPrice: 50,
                    cogs: 20,
                    currentBudget: parseFloat(campaign.daily_budget || campaign.lifetime_budget || 0) / 100,
                    initialBudget: 50,
                    createdAt: campaign.created_time,
                    dailyData: []
                  };
                }
              })
            );
            
            allCampaigns = [...allCampaigns, ...campaignsWithInsights];
          }
        } catch (err) {
          console.error(`Erro ao buscar campanhas da conta ${accountId}:`, err);
        }
      }

      // Salvar campanhas importadas para o usuário atual
      const existingCampaigns = userService.getUserData('campaigns') || [];
      const existingIds = existingCampaigns.map(c => c.facebookCampaignId).filter(Boolean);
      const newCampaigns = allCampaigns.filter(c => !existingIds.includes(c.facebookCampaignId));
      
      const updatedCampaigns = [...existingCampaigns, ...newCampaigns];
      userService.saveUserData('campaigns', updatedCampaigns);

      setIsConnecting(false);
      alert(`${newCampaigns.length} campanhas importadas com sucesso! Configure preços e COGS para ativar as regras automáticas.`);

      // Recarregar página para mostrar campanhas
      window.location.reload();

    } catch (err) {
      setError('Erro ao importar campanhas: ' + err.message);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('Tem certeza que deseja desconectar do Meta?')) {
      userService.logout();
      setIsConnected(false);
      setUserInfo(null);
      setAdAccounts([]);
      setSelectedAccounts([]);
      
      // Recarregar página para limpar estado
      window.location.reload();
    }
  };

  if (isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Meta Conectado</h2>
              <p className="text-sm text-gray-600">
                Conectado como {userInfo?.name}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleDisconnect}
            className="btn btn-danger"
          >
            Desconectar
          </button>
        </div>

        {/* Ad Accounts */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Suas Ad Accounts ({adAccounts.length})
          </h3>
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {adAccounts.map((account) => (
              <div
                key={account.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAccounts.includes(account.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleAccountToggle(account.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedAccounts.includes(account.id)}
                      onChange={() => {}}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Building2 size={20} className="text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-800">{account.name}</h4>
                      <p className="text-sm text-gray-600">
                        ID: {account.id.replace('act_', '')} • {account.currency}
                      </p>
                      <p className="text-xs text-gray-500">
                        Status: {account.account_status === 1 ? 'Ativa' : 'Inativa'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Import Button */}
        <div className="flex justify-center">
          <button
            onClick={handleImportCampaigns}
            disabled={isConnecting || selectedAccounts.length === 0}
            className="btn btn-primary"
          >
            {isConnecting ? (
              <>
                <RefreshCw size={16} className="animate-spin mr-2" />
                Importando Campanhas...
              </>
            ) : (
              `Importar Campanhas (${selectedAccounts.length} contas)`
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 p-4 rounded-lg">
            <div className="flex items-center text-red-800">
              <AlertCircle size={16} className="mr-2" />
              <span className="font-medium">Erro:</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Link className="text-white" size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Conectar Meta Business Manager
        </h2>
        
        <p className="text-gray-600 mb-6">
          Conecte seu Business Manager para importar automaticamente todas as suas ad accounts e campanhas
        </p>

        <button
          onClick={handleConnectMeta}
          disabled={isConnecting}
          className="btn btn-primary text-lg px-8 py-3"
        >
          {isConnecting ? (
            <>
              <RefreshCw size={20} className="animate-spin mr-3" />
              Conectando...
            </>
          ) : (
            <>
              <Link size={20} className="mr-3" />
              Conectar Meta
            </>
          )}
        </button>

        {error && (
          <div className="mt-6 bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-center text-red-800">
              <AlertCircle size={16} className="mr-2" />
              <span className="font-medium">Erro:</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Instruções de configuração */}
        {(!FACEBOOK_APP_ID || FACEBOOK_APP_ID === 'SEU_APP_ID_AQUI') && (
          <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg text-left">
            <h4 className="font-semibold text-orange-800 mb-3">🔧 Configuração Necessária</h4>
            <div className="bg-orange-100 p-3 rounded mb-3">
              <p className="text-orange-800 text-sm mb-2">
                <strong>Facebook App ID não configurado.</strong>
              </p>
              <p className="text-orange-700 text-sm">
                Para conectar ao seu Business Manager, você precisa criar uma Facebook App própria.
              </p>
            </div>
            
            <h5 className="font-semibold text-orange-800 mb-2">Passos rápidos (10 minutos):</h5>
            <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
              <li>Acesse <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="underline font-medium">developers.facebook.com/apps</a></li>
              <li>Crie nova app "Negócios"</li>
              <li>Adicione "Marketing API" e "Facebook Login"</li>
              <li>Configure redirect URI: <code className="bg-white px-1 rounded text-xs">http://localhost:3000/meta-callback</code></li>
              <li>Copie seu App ID e configure no código</li>
            </ol>
            
            <div className="mt-3 p-2 bg-white rounded border border-orange-300">
              <p className="text-orange-800 text-xs">
                📋 <strong>Guia completo:</strong> Veja o arquivo <code>CRIAR_FACEBOOK_APP.md</code> na raiz do projeto
              </p>
            </div>
          </div>
        )}

        {/* Instruções normais */}
        {FACEBOOK_APP_ID && FACEBOOK_APP_ID !== 'SEU_APP_ID_AQUI' && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left">
            <h4 className="font-semibold text-blue-800 mb-2">O que acontece:</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Login seguro no Facebook</li>
              <li>Acesso ao seu Business Manager</li>
              <li>Lista todas as suas ad accounts</li>
              <li>Importa campanhas automaticamente</li>
              <li>Aplica regras automáticas aos dados reais</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaConnector;