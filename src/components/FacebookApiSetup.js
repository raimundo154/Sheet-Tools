import React, { useState, useEffect } from 'react';
import { Settings, Key, CheckCircle, AlertCircle, ExternalLink, Info } from 'lucide-react';
import facebookApi from '../services/facebookApi';
import './FacebookApiSetup.css';

const FacebookApiSetup = ({ onSetupComplete, onClose }) => {
  const [credentials, setCredentials] = useState({
    accessToken: localStorage.getItem('fb_access_token') || '',
    adAccountId: localStorage.getItem('fb_ad_account_id') || ''
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [adAccounts, setAdAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  useEffect(() => {
    // Check if we already have valid credentials
    if (credentials.accessToken && credentials.adAccountId) {
      testConnection();
    }
  }, []);

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    setConnectionStatus(null); // Reset status when credentials change
  };

  const testConnection = async () => {
    if (!credentials.accessToken) {
      setConnectionStatus({
        success: false,
        message: 'Por favor, insira um Access Token válido.'
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus(null);

    try {
      // Set credentials in the API service
      facebookApi.setCredentials(credentials.accessToken, credentials.adAccountId);

      // Test the connection by getting user info
      const userResponse = await facebookApi.makeRequest('/me', {
        fields: 'id,name,email'
      });

      setConnectionStatus({
        success: true,
        message: `Conectado com sucesso! Usuário: ${userResponse.name}`,
        user: userResponse
      });

      // Load ad accounts
      await loadAdAccounts();

    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus({
        success: false,
        message: `Erro de conexão: ${error.message}`
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const loadAdAccounts = async () => {
    if (!credentials.accessToken) return;

    setIsLoadingAccounts(true);
    try {
      const accountsResponse = await facebookApi.makeRequest('/me/adaccounts', {
        fields: 'id,name,currency,account_status,timezone_name'
      });

      setAdAccounts(accountsResponse.data || []);
    } catch (error) {
      console.error('Error loading ad accounts:', error);
      setConnectionStatus({
        success: false,
        message: `Erro ao carregar contas de anúncios: ${error.message}`
      });
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleAccountSelect = (accountId) => {
    const cleanAccountId = accountId.replace('act_', '');
    setCredentials(prev => ({
      ...prev,
      adAccountId: cleanAccountId
    }));
  };

  const saveCredentials = () => {
    if (!credentials.accessToken || !credentials.adAccountId) {
      setConnectionStatus({
        success: false,
        message: 'Por favor, preencha todos os campos obrigatórios.'
      });
      return;
    }

    // Save credentials to localStorage
    localStorage.setItem('fb_access_token', credentials.accessToken);
    localStorage.setItem('fb_ad_account_id', credentials.adAccountId);

    // Set credentials in the API service
    facebookApi.setCredentials(credentials.accessToken, credentials.adAccountId);

    // Notify parent component
    if (onSetupComplete) {
      onSetupComplete({
        accessToken: credentials.accessToken,
        adAccountId: credentials.adAccountId
      });
    }
  };

  const clearCredentials = () => {
    setCredentials({
      accessToken: '',
      adAccountId: ''
    });
    setConnectionStatus(null);
    setAdAccounts([]);
    localStorage.removeItem('fb_access_token');
    localStorage.removeItem('fb_ad_account_id');
  };

  return (
    <div className="facebook-api-setup-overlay">
      <div className="facebook-api-setup-modal">
        <div className="setup-header">
          <div className="header-content">
            <Settings size={24} />
            <div>
              <h2>Configuração da API do Facebook</h2>
              <p>Configure sua conexão com a API do Facebook Marketing para Product Research automático</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="setup-content">
          {/* Instructions Section */}
          <div className="instructions-section">
            <div className="section-header">
              <Info size={20} />
              <h3>Como obter suas credenciais</h3>
            </div>
            
            <div className="instruction-steps">
              <div className="step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <strong>Acesse o Facebook Developers</strong>
                  <p>Vá para <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer">developers.facebook.com</a> e faça login</p>
                </div>
              </div>
              
              <div className="step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <strong>Crie ou selecione um App</strong>
                  <p>No painel, crie um novo app ou selecione um existente do tipo "Business"</p>
                </div>
              </div>
              
              <div className="step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <strong>Adicione o Marketing API</strong>
                  <p>No seu app, adicione o produto "Marketing API" nas configurações</p>
                </div>
              </div>
              
              <div className="step">
                <span className="step-number">4</span>
                <div className="step-content">
                  <strong>Gere um Access Token</strong>
                  <p>Nas ferramentas do Graph API Explorer, gere um token com as permissões: <code>ads_read</code>, <code>ads_management</code></p>
                </div>
              </div>
            </div>

            <div className="external-links">
              <a 
                href="https://developers.facebook.com/tools/explorer/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="external-link"
              >
                <ExternalLink size={16} />
                Graph API Explorer
              </a>
              <a 
                href="https://developers.facebook.com/docs/marketing-api/get-started" 
                target="_blank" 
                rel="noopener noreferrer"
                className="external-link"
              >
                <ExternalLink size={16} />
                Documentação Marketing API
              </a>
            </div>
          </div>

          {/* Credentials Form */}
          <div className="credentials-section">
            <div className="section-header">
              <Key size={20} />
              <h3>Credenciais da API</h3>
            </div>

            <div className="form-group">
              <label>Access Token do Facebook *</label>
              <textarea
                placeholder="Cole seu Access Token aqui (ex: EAAG...)"
                value={credentials.accessToken}
                onChange={(e) => handleInputChange('accessToken', e.target.value)}
                rows={3}
                className="token-input"
              />
              <small>Token com permissões ads_read e ads_management</small>
            </div>

            <div className="form-group">
              <label>ID da Conta de Anúncios</label>
              {adAccounts.length > 0 ? (
                <select
                  value={`act_${credentials.adAccountId}`}
                  onChange={(e) => handleAccountSelect(e.target.value)}
                  className="account-select"
                >
                  <option value="">Selecione uma conta de anúncios</option>
                  {adAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.id}) - {account.currency}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="ID da conta (ex: 123456789012345)"
                  value={credentials.adAccountId}
                  onChange={(e) => handleInputChange('adAccountId', e.target.value)}
                  className="account-input"
                />
              )}
              <small>Apenas números, sem o prefixo "act_"</small>
            </div>

            {/* Connection Test */}
            <div className="connection-test">
              <button
                className="test-btn"
                onClick={testConnection}
                disabled={isTestingConnection || !credentials.accessToken}
              >
                {isTestingConnection ? 'Testando...' : 'Testar Conexão'}
              </button>

              {isLoadingAccounts && (
                <div className="loading-accounts">
                  <span>Carregando contas de anúncios...</span>
                </div>
              )}

              {connectionStatus && (
                <div className={`connection-status ${connectionStatus.success ? 'success' : 'error'}`}>
                  {connectionStatus.success ? (
                    <CheckCircle size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                  <span>{connectionStatus.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ad Accounts List */}
          {adAccounts.length > 0 && (
            <div className="accounts-section">
              <div className="section-header">
                <h3>Contas de Anúncios Disponíveis</h3>
              </div>
              
              <div className="accounts-list">
                {adAccounts.map(account => (
                  <div 
                    key={account.id} 
                    className={`account-item ${credentials.adAccountId === account.id.replace('act_', '') ? 'selected' : ''}`}
                    onClick={() => handleAccountSelect(account.id)}
                  >
                    <div className="account-info">
                      <strong>{account.name}</strong>
                      <span className="account-id">{account.id}</span>
                    </div>
                    <div className="account-details">
                      <span className="currency">{account.currency}</span>
                      <span className={`status ${account.account_status === 1 ? 'active' : 'inactive'}`}>
                        {account.account_status === 1 ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="setup-footer">
          <div className="footer-actions">
            <button className="clear-btn" onClick={clearCredentials}>
              Limpar Dados
            </button>
            <div className="primary-actions">
              <button className="cancel-btn" onClick={onClose}>
                Cancelar
              </button>
              <button 
                className="save-btn"
                onClick={saveCredentials}
                disabled={!credentials.accessToken || !credentials.adAccountId || !connectionStatus?.success}
              >
                Salvar e Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookApiSetup;