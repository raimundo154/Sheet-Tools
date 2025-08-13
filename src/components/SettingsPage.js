import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Facebook, 
  ShoppingBag,
  Store,
  CheckCircle,
  AlertCircle,
  Settings as SettingsIcon,
  Shield,
  CreditCard
} from 'lucide-react';
import authService from '../services/authService';
import { supabase } from '../config/supabase';
import './SettingsPage.css';

const SettingsPage = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [connections, setConnections] = useState({
    meta: false,
    shopify: false
  });
  const [stats, setStats] = useState({
    shopifyStores: 0,
    facebookAccounts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user from auth service
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        console.error('No authenticated user found');
        return;
      }

      setUser(currentUser);
      setDisplayName(currentUser.user_metadata?.display_name || currentUser.user_metadata?.full_name || '');

      // Load user profile data from database
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error loading user profile:', profileError);
      } else if (profile) {
        setUserProfile(profile);
      }

      // Check connection status and get stats
      await loadConnectionsAndStats(currentUser.id);

    } catch (error) {
      console.error('Error loading user data:', error);
      setMessage('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  const loadConnectionsAndStats = async (userId) => {
    try {
      // Check if user has Shopify stores connected
      const { data: shopifyStores, error: shopifyError } = await supabase
        .from('user_shops')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (!shopifyError) {
        setStats(prev => ({ ...prev, shopifyStores: shopifyStores?.length || 0 }));
        setConnections(prev => ({ ...prev, shopify: (shopifyStores?.length || 0) > 0 }));
      }

      // Check Facebook/Meta connection status
      // This would typically check for stored Facebook tokens or connection data
      // For now, we'll simulate this check
      const metaConnected = localStorage.getItem('meta_connection') !== null;
      setConnections(prev => ({ ...prev, meta: metaConnected }));

      // Count Facebook accounts (this would come from your Meta API integration)
      const facebookAccountsCount = metaConnected ? 1 : 0;
      setStats(prev => ({ ...prev, facebookAccounts: facebookAccountsCount }));

    } catch (error) {
      console.error('Error loading connections and stats:', error);
    }
  };

  const handleSaveDisplayName = async () => {
    if (!displayName.trim()) {
      setMessage('Nome de exibição não pode estar vazio');
      return;
    }

    try {
      setIsSaving(true);
      
      // Update user metadata in Supabase Auth
      const { error } = await authService.updateProfile({
        display_name: displayName.trim()
      });

      if (error) {
        throw error;
      }

      setMessage('Nome de exibição atualizado com sucesso!');
      setIsEditingName(false);
      
      // Refresh user data
      setTimeout(() => {
        loadUserData();
        setMessage('');
      }, 2000);

    } catch (error) {
      console.error('Error updating display name:', error);
      setMessage('Erro ao atualizar nome de exibição');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setDisplayName(user?.user_metadata?.display_name || user?.user_metadata?.full_name || '');
    setMessage('');
  };

  const getAccountCreationMethod = () => {
    if (!user) return 'Desconhecido';
    
    // Check if user was created with Google OAuth
    if (user.app_metadata?.provider === 'google') {
      return 'Google';
    }
    
    // Check if user has email/password
    if (user.email && !user.app_metadata?.provider) {
      return 'Email/Senha';
    }
    
    return 'Desconhecido';
  };

  const isGoogleAccount = () => {
    return user?.app_metadata?.provider === 'google';
  };

  const getProgressPercentage = () => {
    const totalSteps = 2; // Meta + Shopify
    const completedSteps = (connections.meta ? 1 : 0) + (connections.shopify ? 1 : 0);
    return (completedSteps / totalSteps) * 100;
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-header">
          <div className="header-content">
            <div className="header-title">
              <SettingsIcon size={28} />
              <h1>Configurações da Conta</h1>
            </div>
          </div>
        </div>
        
        <div className="settings-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Carregando configurações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div className="header-content">
          <div className="header-title">
            <SettingsIcon size={28} />
            <h1>Configurações da Conta</h1>
          </div>
          <p className="header-subtitle">
            Gerencie suas informações pessoais e conexões
          </p>
        </div>
      </div>

      <div className="settings-content">
        {/* Message Display */}
        {message && (
          <div className={`settings-message ${message.includes('sucesso') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Account Information */}
        <div className="settings-section">
          <div className="section-header">
            <User size={20} />
            <h2>Informações da Conta</h2>
          </div>
          
          <div className="account-info">
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <Mail size={16} />
                  Email
                </div>
                <div className="info-value">
                  {user?.email || 'Não disponível'}
                </div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <Calendar size={16} />
                  Conta criada em
                </div>
                <div className="info-value">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-PT') : 'Não disponível'}
                </div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <Shield size={16} />
                  Método de criação
                </div>
                <div className="info-value">
                  {getAccountCreationMethod()}
                </div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <User size={16} />
                  Nome de exibição
                </div>
                <div className="info-value">
                  {isEditingName ? (
                    <div className="edit-name-container">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="edit-name-input"
                        placeholder="Insira seu nome de exibição"
                        disabled={isSaving}
                      />
                      <div className="edit-actions">
                        <button
                          onClick={handleSaveDisplayName}
                          className="save-btn"
                          disabled={isSaving || !displayName.trim()}
                        >
                          {isSaving ? <div className="btn-spinner"></div> : <Save size={14} />}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="cancel-btn"
                          disabled={isSaving}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="display-name-container">
                      <span>{displayName || 'Não definido'}</span>
                      {isGoogleAccount() && (
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="edit-btn"
                          title="Editar nome de exibição"
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!isGoogleAccount() && (
              <div className="account-note">
                <AlertCircle size={16} />
                <p>Para contas criadas com email/senha, o nome de exibição não pode ser alterado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Connection Status */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-title">
              <div className="title-content">
                <h2>Status das Conexões</h2>
                <div className="connection-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    {Math.round(getProgressPercentage())}% completo
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="connections-grid">
            <div className={`connection-card ${connections.meta ? 'connected' : 'not-connected'}`}>
              <div className="connection-header">
                <div className="connection-icon">
                  <Facebook size={24} />
                </div>
                <div className="connection-status">
                  {connections.meta ? (
                    <CheckCircle size={16} className="status-icon connected" />
                  ) : (
                    <AlertCircle size={16} className="status-icon not-connected" />
                  )}
                  <span className="status-text">
                    {connections.meta ? 'Conectado' : 'Não conectado'}
                  </span>
                </div>
              </div>
              <div className="connection-info">
                <h3>Meta / Facebook</h3>
                <p>Conexão com Facebook Ads para importar campanhas e métricas</p>
                <div className="connection-stats">
                  <span>Contas conectadas: {stats.facebookAccounts}</span>
                </div>
              </div>
              {!connections.meta && (
                <div className="connection-progress-bar">
                  <div className="progress-line"></div>
                  <div className="progress-step active">1</div>
                  <div className="progress-line"></div>
                  <div className="progress-step">2</div>
                  <div className="progress-line"></div>
                </div>
              )}
            </div>

            <div className={`connection-card ${connections.shopify ? 'connected' : 'not-connected'}`}>
              <div className="connection-header">
                <div className="connection-icon">
                  <ShoppingBag size={24} />
                </div>
                <div className="connection-status">
                  {connections.shopify ? (
                    <CheckCircle size={16} className="status-icon connected" />
                  ) : (
                    <AlertCircle size={16} className="status-icon not-connected" />
                  )}
                  <span className="status-text">
                    {connections.shopify ? 'Conectado' : 'Não conectado'}
                  </span>
                </div>
              </div>
              <div className="connection-info">
                <h3>Shopify</h3>
                <p>Conexão com sua loja Shopify para sincronizar vendas</p>
                <div className="connection-stats">
                  <span>Lojas conectadas: {stats.shopifyStores}</span>
                </div>
              </div>
              {!connections.shopify && (
                <div className="connection-progress-bar">
                  <div className="progress-line"></div>
                  <div className="progress-step active">1</div>
                  <div className="progress-line"></div>
                  <div className="progress-step">2</div>
                  <div className="progress-line"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div className="settings-section">
          <div className="section-header">
            <Store size={20} />
            <h2>Estatísticas da Conta</h2>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <ShoppingBag size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.shopifyStores}</div>
                <div className="stat-label">Lojas Shopify</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Facebook size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.facebookAccounts}</div>
                <div className="stat-label">Contas Facebook</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <CreditCard size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">Ativo</div>
                <div className="stat-label">Estado da Conta</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;