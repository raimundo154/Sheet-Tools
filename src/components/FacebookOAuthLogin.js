import React, { useState, useEffect } from 'react';
import { Link, User, LogOut, CheckCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import facebookOAuth from '../services/facebookOAuth';

const FacebookOAuthLogin = ({ onAuthSuccess, onAuthError }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuthStatus = () => {
      if (facebookOAuth.isAuthenticated()) {
        const authInfo = facebookOAuth.getAuthData();
        setAuthData(authInfo);
        setIsAuthenticated(true);
        
        // Notificar componente pai
        if (onAuthSuccess) {
          onAuthSuccess(authInfo);
        }
      }
    };
    
    checkAuthStatus();
    
    // Verificar se está em modo demo
    setDemoMode(facebookOAuth.demoMode);
  }, [onAuthSuccess]);



  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Abrir popup de login do Facebook
      const authResult = await facebookOAuth.openLoginPopup();
      
      // Obter contas de anúncios do usuário
      const userAccounts = await facebookOAuth.getUserAdAccounts(authResult.access_token);
      
      if (userAccounts.length === 0) {
        throw new Error('Nenhuma conta de anúncios encontrada');
      }
      
      if (userAccounts.length === 1) {
        // Se só tem uma conta, selecionar automaticamente
        const authInfo = facebookOAuth.saveAuthData(authResult, userAccounts[0]);
        setAuthData(authInfo);
        setIsAuthenticated(true);
        
        if (onAuthSuccess) {
          onAuthSuccess(authInfo);
        }
      } else {
        // Mostrar seletor de contas
        setAccounts(userAccounts);
        setShowAccountSelector(true);
        // Temporariamente salvar dados de auth
        window.tempAuthResult = authResult;
      }
      
    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.message);
      
      if (onAuthError) {
        onAuthError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountSelect = (account) => {
    const authResult = window.tempAuthResult;
    const authInfo = facebookOAuth.saveAuthData(authResult, account);
    
    setAuthData(authInfo);
    setIsAuthenticated(true);
    setShowAccountSelector(false);
    setAccounts([]);
    delete window.tempAuthResult;
    
    if (onAuthSuccess) {
      onAuthSuccess(authInfo);
    }
  };

  const handleLogout = () => {
    facebookOAuth.logout();
    setIsAuthenticated(false);
    setAuthData(null);
    setError('');
    setShowAccountSelector(false);
    setAccounts([]);
  };

  const formatExpiryDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('pt-PT');
  };

  // Seletor de contas
  if (showAccountSelector) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Selecionar Conta de Anúncios
          </h3>
          <button
            onClick={() => setShowAccountSelector(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Encontramos {accounts.length} conta(s) de anúncios. Selecione qual deseja usar:
        </p>
        
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              onClick={() => handleAccountSelect(account)}
              className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-800">{account.name}</h4>
                  <p className="text-sm text-gray-600">
                    ID: {account.id} • Moeda: {account.currency}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {account.account_status === 1 ? 'Ativa' : 'Inativa'}
                  </p>
                </div>
                <div className="text-blue-600">
                  <ExternalLink size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Interface de login/logout
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Link className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Conectar Facebook Ads
            </h3>
            <p className="text-sm text-gray-600">
              Login OAuth para múltiplos usuários
            </p>
          </div>
        </div>
        
        {isAuthenticated && (
          <div className="flex items-center text-green-600">
            <CheckCircle size={16} className="mr-1" />
            <span className="text-sm">Conectado</span>
          </div>
        )}
      </div>

      {/* Status de autenticação */}
      {isAuthenticated && authData ? (
        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-green-800 flex items-center">
              <User size={16} className="mr-2" />
              Conta Conectada
            </h4>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 text-sm flex items-center"
            >
              <LogOut size={14} className="mr-1" />
              Desconectar
            </button>
          </div>
          
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>Conta:</strong> {authData.accountName}</p>
            <p><strong>ID:</strong> {authData.adAccountId}</p>
            <p><strong>Moeda:</strong> {authData.currency}</p>
            <p><strong>Conectado em:</strong> {new Date(authData.connectedAt).toLocaleString('pt-PT')}</p>
            <p><strong>Expira em:</strong> {formatExpiryDate(authData.expiresAt)}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="mb-4">
            <User size={48} className="mx-auto text-gray-300 mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">
              Conecte sua conta Facebook Ads
            </h4>
            <p className="text-gray-600 text-sm mb-4">
              Login seguro via OAuth. Suas credenciais ficam protegidas no Facebook.
            </p>
          </div>
          
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin mr-2" />
                Conectando...
              </>
            ) : (
              <>
                <Link size={16} className="mr-2" />
                Conectar com Facebook
              </>
            )}
          </button>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg mt-4">
          <div className="flex items-center text-red-800">
            <AlertCircle size={16} className="mr-2" />
            <span className="font-medium">Erro:</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Informações sobre OAuth */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        {demoMode ? (
          <>
            <h4 className="font-semibold text-orange-800 mb-2">🚀 Modo Demonstração Ativo</h4>
            <div className="bg-orange-100 p-3 rounded mb-3">
              <p className="text-orange-800 text-sm mb-2">
                <strong>Facebook App ID não configurado.</strong> Usando dados simulados para demonstração.
              </p>
              <p className="text-orange-700 text-sm">
                ✅ Pode testar todas as funcionalidades<br/>
                ✅ Dados demo são criados automaticamente<br/>
                ✅ Regras automáticas funcionam normalmente
              </p>
            </div>
            
            <h4 className="font-semibold text-blue-800 mb-2">Para usar dados reais:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Crie uma Facebook App em <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="underline">developers.facebook.com</a></li>
              <li>Configure OAuth redirect: <code className="bg-white px-1 rounded">http://localhost:3000/facebook-callback.html</code></li>
              <li>Copie <code className="bg-white px-1 rounded">env.example</code> para <code className="bg-white px-1 rounded">.env</code></li>
              <li>Adicione seu App ID: <code className="bg-white px-1 rounded">REACT_APP_FACEBOOK_APP_ID=seu_app_id</code></li>
              <li>Reinicie a aplicação</li>
            </ol>
          </>
        ) : (
          <>
            <h4 className="font-semibold text-blue-800 mb-2">Como funciona:</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Clique em "Conectar com Facebook"</li>
              <li>Será redirecionado para login seguro do Facebook</li>
              <li>Autorize as permissões necessárias</li>
              <li>Selecione sua conta de anúncios</li>
              <li>Suas campanhas serão importadas automaticamente</li>
            </ul>
            
            <div className="mt-3 p-3 bg-white rounded border-l-4 border-blue-400">
              <p className="text-blue-800 text-sm">
                <strong>Seguro:</strong> Usamos OAuth oficial do Facebook. 
                Suas credenciais nunca passam por nossos servidores.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FacebookOAuthLogin;