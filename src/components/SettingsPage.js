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
  CreditCard,
  Link,
  ExternalLink,
  Copy
} from 'lucide-react';
import authService from '../services/authService';
import { supabase } from '../config/supabase';
import { userConfigService } from '../services/userConfigService';
import PageHeader from './PageHeader';
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
  const [showShopifyModal, setShowShopifyModal] = useState(false);
  const [shopifyDomain, setShopifyDomain] = useState('');
  const [isSavingDomain, setIsSavingDomain] = useState(false);
  const [domainSaveMessage, setDomainSaveMessage] = useState('');

  useEffect(() => {
    initializeAndLoadData();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadUserData(session?.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        setConnections({ meta: false, shopify: false });
        setStats({ shopifyStores: 0, facebookAccounts: 0 });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeAndLoadData = async () => {
    try {
      setLoading(true);
      
      // Initialize auth service first
      const session = await authService.initialize();
      
      if (session?.user) {
        await loadUserData(session.user);
      } else {
        console.error('No authenticated user found during initialization');
        setMessage('Session expired. Please login again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error initializing:', error);
      setLoading(false);
    }
  };

  const loadUserData = async (currentUser = null) => {
    try {
      if (!currentUser) {
        // Try to get current user from auth service
        currentUser = authService.getCurrentUser();
        
        // If still no user, try to get from current session
        if (!currentUser) {
          const { data: { session } } = await supabase.auth.getSession();
          currentUser = session?.user;
        }
        
        if (!currentUser) {
          console.error('No authenticated user found');
          return;
        }
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
      setMessage('Error loading user data');
    } finally {
      setLoading(false);
    }
  };

  const loadConnectionsAndStats = async (userId) => {
    try {
      // Check if user has Shopify stores connected or domain configured
      const { data: shopifyStores, error: shopifyError } = await supabase
        .from('user_shops')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      // Also check if user has Shopify domain configured via userConfigService
      let isShopifyConfigured = false;
      let shopifyStoreCount = 0;

      if (!shopifyError && shopifyStores && shopifyStores.length > 0) {
        isShopifyConfigured = true;
        shopifyStoreCount = shopifyStores.length;
      } else {
        // Check if domain is configured in user_profiles
        try {
          const result = await userConfigService.getShopifyDomain();
          if (result.success && result.data && result.data.trim()) {
            isShopifyConfigured = true;
            shopifyStoreCount = 1; // Domain configured counts as 1 store
          }
        } catch (error) {
          console.log('No Shopify domain configured yet');
        }
      }

      setStats(prev => ({ ...prev, shopifyStores: shopifyStoreCount }));
      setConnections(prev => ({ ...prev, shopify: isShopifyConfigured }));

      // Check Facebook/Meta connection status from database
      const { data: metaConnections, error: metaError } = await supabase
        .from('user_profiles')
        .select('facebook_access_token, facebook_user_id, meta_connected')
        .eq('user_id', userId)
        .single();

      let isMetaConnected = false;
      let facebookAccountsCount = 0;

      if (!metaError && metaConnections) {
        // Check if user has valid Facebook connection
        isMetaConnected = metaConnections.meta_connected === true || 
                         (metaConnections.facebook_access_token && metaConnections.facebook_user_id);
        facebookAccountsCount = isMetaConnected ? 1 : 0;
      } else {
        // Fallback to localStorage check for backward compatibility
        const metaConnectionData = localStorage.getItem('meta_connection');
        if (metaConnectionData) {
          try {
            const connectionData = JSON.parse(metaConnectionData);
            isMetaConnected = !!(connectionData.accessToken && connectionData.userID);
            facebookAccountsCount = isMetaConnected ? 1 : 0;
          } catch (e) {
            console.warn('Invalid meta_connection data in localStorage');
          }
        }
      }

      setConnections(prev => ({ ...prev, meta: isMetaConnected }));
      setStats(prev => ({ ...prev, facebookAccounts: facebookAccountsCount }));

      console.log('Connection status loaded:', { 
        shopify: isShopifyConfigured, 
        meta: isMetaConnected,
        shopifyStores: shopifyStoreCount,
        facebookAccounts: facebookAccountsCount 
      });

    } catch (error) {
      console.error('Error loading connections and stats:', error);
      // Set default values on error
      setConnections({ meta: false, shopify: false });
      setStats({ shopifyStores: 0, facebookAccounts: 0 });
    }
  };

  const handleSaveDisplayName = async () => {
    if (!displayName.trim()) {
      setMessage('Display name cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      
      // Update user metadata in Supabase Auth
      const { data, error } = await authService.updateProfile({
        display_name: displayName.trim()
      });

      if (error) {
        throw error;
      }

      setMessage('Display name updated successfully!');
      setIsEditingName(false);
      
      // Update local user state immediately
      if (data.user) {
        setUser(data.user);
        setDisplayName(data.user.user_metadata?.display_name || data.user.user_metadata?.full_name || '');
      }
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);

    } catch (error) {
      console.error('Error updating display name:', error);
      setMessage('Error updating display name');
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
    if (!user) return 'Unknown';
    
    // Check if user was created with Google OAuth
    if (user.app_metadata?.provider === 'google') {
      return 'Google';
    }
    
    // Check if user has email/password
    if (user.email && !user.app_metadata?.provider) {
      return 'Email/Password';
    }
    
    return 'Unknown';
  };

  const isGoogleAccount = () => {
    return user?.app_metadata?.provider === 'google';
  };

  const getProgressPercentage = () => {
    const totalSteps = 2; // Meta + Shopify
    const completedSteps = (connections.meta ? 1 : 0) + (connections.shopify ? 1 : 0);
    return (completedSteps / totalSteps) * 100;
  };

  // Load Shopify domain when opening modal
  useEffect(() => {
    if (showShopifyModal) {
      loadShopifyDomain();
    }
  }, [showShopifyModal]);

  const loadShopifyDomain = async () => {
    try {
      const result = await userConfigService.getShopifyDomain();
      if (result.success && result.data) {
        setShopifyDomain(result.data);
      }
    } catch (error) {
      console.error('Error loading Shopify domain:', error);
    }
  };

  const handleSaveDomain = async () => {
    console.log('🔄 Starting handleSaveDomain with domain:', shopifyDomain);
    
    if (!shopifyDomain.trim()) {
      console.log('❌ Empty domain');
      setDomainSaveMessage('Please enter a valid domain');
      return;
    }

    setIsSavingDomain(true);
    setDomainSaveMessage('Saving...');

    try {
      console.log('🚀 Calling userConfigService.saveShopifyDomain...');
      const result = await userConfigService.saveShopifyDomain(shopifyDomain);
      console.log('📥 Result received:', result);
      
      if (result.success) {
        console.log('✅ Save successful');
        setDomainSaveMessage('✅ Domain saved successfully!');
        setTimeout(() => setDomainSaveMessage(''), 3000);
      } else {
        console.error('❌ Save failed:', result.error);
        setDomainSaveMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('💥 Unexpected error:', error);
      setDomainSaveMessage(`❌ Unexpected error: ${error.message}`);
    } finally {
      setIsSavingDomain(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessage('✅ Copied to clipboard!');
      setTimeout(() => setMessage(''), 2000);
    });
  };

  const handleShopifySetupComplete = () => {
    setShowShopifyModal(false);
    // Mark shopify as connected
    setConnections(prev => ({ ...prev, shopify: true }));
    setStats(prev => ({ ...prev, shopifyStores: 1 }));
    setMessage('Shopify configured successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleConnectShopify = async () => {
    try {
      if (!user?.id) {
        setMessage('Error: User not authenticated');
        return;
      }

      // Check if Shopify is already configured
      if (connections.shopify) {
        setMessage('Shopify is already configured');
        return;
      }

      // Double check both database and domain configuration
      const { data: existingShops, error: checkError } = await supabase
        .from('user_shops')
        .select('shop_domain')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (checkError) {
        console.error('Error checking existing shops:', checkError);
        setMessage('Error checking existing connections');
        return;
      }

      if (existingShops && existingShops.length > 0) {
        setMessage(`You already have a connected store: ${existingShops[0].shop_domain}`);
        // Update connection status
        setConnections(prev => ({ ...prev, shopify: true }));
        setStats(prev => ({ ...prev, shopifyStores: existingShops.length }));
        return;
      }

      // Check if domain is already configured
      try {
        const result = await userConfigService.getShopifyDomain();
        if (result.success && result.data && result.data.trim()) {
          setMessage(`Shopify already configured: ${result.data}`);
          // Update connection status
          setConnections(prev => ({ ...prev, shopify: true }));
          setStats(prev => ({ ...prev, shopifyStores: 1 }));
          return;
        }
      } catch (error) {
        console.log('No previous Shopify configuration found');
      }

      // Open Shopify setup modal exactly like in onboarding
      setShowShopifyModal(true);
      
    } catch (error) {
      console.error('Error connecting to Shopify:', error);
      setMessage('Error connecting to Shopify');
    }
  };

  const handleConnectFacebook = async () => {
    try {
      if (!user?.id) {
        setMessage('Error: User not authenticated');
        return;
      }

      // Check if Facebook is already connected
      if (connections.meta) {
        setMessage('Facebook is already connected');
        return;
      }

      // Double check database for Facebook connection
      const { data: profile, error: checkError } = await supabase
        .from('user_profiles')
        .select('facebook_access_token, facebook_user_id, meta_connected')
        .eq('user_id', user.id)
        .single();

      if (!checkError && profile) {
        const isAlreadyConnected = profile.meta_connected === true || 
                                 (profile.facebook_access_token && profile.facebook_user_id);
        
        if (isAlreadyConnected) {
          setMessage('Facebook is already connected');
          // Update connection status
          setConnections(prev => ({ ...prev, meta: true }));
          setStats(prev => ({ ...prev, facebookAccounts: 1 }));
          return;
        }
      }

      // Check localStorage fallback
      const metaConnectionData = localStorage.getItem('meta_connection');
      if (metaConnectionData) {
        try {
          const connectionData = JSON.parse(metaConnectionData);
          if (connectionData.accessToken && connectionData.userID) {
            setMessage('Facebook is already connected');
            // Update connection status
            setConnections(prev => ({ ...prev, meta: true }));
            setStats(prev => ({ ...prev, facebookAccounts: 1 }));
            return;
          }
        } catch (e) {
          console.warn('Invalid meta_connection data in localStorage');
        }
      }

      // Mark Facebook as connected exactly like in onboarding tutorial
      setConnections(prev => ({ ...prev, meta: true }));
      setStats(prev => ({ ...prev, facebookAccounts: 1 }));
      setMessage('✅ Facebook connected successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error connecting to Facebook:', error);
      setMessage('Error connecting to Facebook');
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <PageHeader 
          title="Settings"
          subtitle="Manage your personal information and connections"
          showProfile={true}
        />
        
        <div className="settings-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      {/* Header */}
      <PageHeader 
        title="Settings"
        subtitle="Manage your personal information and connections"
        showProfile={true}
      />

      <div className="settings-content">
        {/* Message Display */}
        {message && (
          <div className={`settings-message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Account Information */}
        <div className="settings-section">
          <div className="section-header">
            <User size={20} />
            <h2>Account Information</h2>
          </div>
          
          <div className="account-info">
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <Mail size={16} />
                  Email
                </div>
                <div className="info-value">
                  {user?.email || 'Email not available'}
                </div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <Calendar size={16} />
                  Account created on
                </div>
                <div className="info-value">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Date not available'}
                </div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <Shield size={16} />
                  Creation method
                </div>
                <div className="info-value">
                  {getAccountCreationMethod()}
                </div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <User size={16} />
                  Display name
                </div>
                <div className="info-value">
                  {isEditingName ? (
                    <div className="edit-name-container">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="edit-name-input"
                        placeholder="Enter your display name"
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
                      <span>{displayName || 'Not set'}</span>
                      {isGoogleAccount() && (
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="edit-btn"
                          title="Edit display name"
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
                <p>For accounts created with email/password, the display name cannot be changed.</p>
              </div>
            )}
          </div>
        </div>

        {/* Connection Status */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-title">
              <div className="title-content">
                <h2>Connection Status</h2>
                <div className="connection-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    {Math.round(getProgressPercentage())}% complete
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
                    {connections.meta ? 'Connected' : 'Not connected'}
                  </span>
                </div>
              </div>
              <div className="connection-info">
                <h3>Meta / Facebook</h3>
                <p>Connection to Facebook Ads to import campaigns and metrics</p>
                <div className="connection-stats">
                  <span>Connected accounts: {stats.facebookAccounts}</span>
                </div>
              </div>
              <div className="connection-actions">
                {!connections.meta ? (
                  <button 
                    className="connect-button meta-connect"
                    onClick={handleConnectFacebook}
                    title="Connect to Facebook"
                  >
                    <Link size={14} />
                    Connect
                  </button>
                ) : (
                  <div className="connection-success">
                    <CheckCircle size={16} />
                    <span>Active connection</span>
                  </div>
                )}
              </div>
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
                    {connections.shopify ? 'Connected' : 'Not connected'}
                  </span>
                </div>
              </div>
              <div className="connection-info">
                <h3>Shopify</h3>
                <p>Connection to your Shopify store to synchronize sales</p>
                <div className="connection-stats">
                  <span>Connected stores: {stats.shopifyStores}</span>
                </div>
              </div>
              <div className="connection-actions">
                {!connections.shopify ? (
                  <button 
                    className="connect-button shopify-connect"
                    onClick={handleConnectShopify}
                    title="Connect to Shopify"
                  >
                    <Link size={14} />
                    Connect
                  </button>
                ) : (
                  <div className="connection-success">
                    <CheckCircle size={16} />
                    <span>Active connection</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div className="settings-section">
          <div className="section-header">
            <Store size={20} />
            <h2>Account Statistics</h2>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <ShoppingBag size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.shopifyStores}</div>
                <div className="stat-label">Shopify Stores</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Facebook size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.facebookAccounts}</div>
                <div className="stat-label">Facebook Accounts</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <CreditCard size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">Active</div>
                <div className="stat-label">Account Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shopify Setup Modal - Exactly like in OnboardingTutorial */}
      {showShopifyModal && (
        <div className="tutorial-overlay">
          <div className="tutorial-modal shopify-setup-modal">
            <div className="modal-header">
              <div className="modal-title">
                <ShoppingBag size={24} style={{ color: '#96BF48' }} />
                <span>Shopify Configuration</span>
              </div>
              <button
                onClick={() => setShowShopifyModal(false)}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="setup-section">
                <h4>1. Configure the Webhook</h4>
                <p>Add the webhook below to your Shopify store settings:</p>
                
                <div className="webhook-url">
                  <span>https://your-site.netlify.app/.netlify/functions/shopify-webhook</span>
                  <button 
                    onClick={() => copyToClipboard('https://your-site.netlify.app/.netlify/functions/shopify-webhook')}
                    className="copy-btn"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                
                <div className="webhook-settings">
                  <p><strong>Event:</strong> Order creation</p>
                  <p><strong>Format:</strong> JSON</p>
                  <p><strong>API Version:</strong> 2023-10</p>
                </div>
              </div>

              <div className="setup-section">
                <h4>2. Configure the Domain</h4>
                <p>Enter your Shopify store domain:</p>
                
                <div className="domain-input-group">
                  <input
                    type="text"
                    value={shopifyDomain}
                    onChange={(e) => setShopifyDomain(e.target.value)}
                    placeholder="example: mystore.myshopify.com ou mystore.com"
                    className="domain-input"
                    disabled={isSavingDomain}
                  />
                  <button
                    onClick={handleSaveDomain}
                    className="save-domain-btn"
                    disabled={isSavingDomain || !shopifyDomain.trim()}
                  >
                    {isSavingDomain ? 'Saving...' : 'Save'}
                  </button>
                </div>
                
                {domainSaveMessage && (
                  <div className="domain-save-message">
                    {domainSaveMessage}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowShopifyModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleShopifySetupComplete}
                className="btn-primary"
              >
                Complete Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;