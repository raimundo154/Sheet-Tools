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
  const [accessToken, setAccessToken] = useState('');

  // Your Facebook App - Sheet Tools
  const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || '1525902928789947';

  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = () => {
    // Check if user is logged in
    if (userService.isLoggedIn()) {
      const user = userService.getCurrentUser();
      const connectionData = userService.getUserData('connection_data');
      
      if (connectionData) {
        setIsConnected(true);
        setUserInfo(user);
        setAdAccounts(connectionData.adAccounts || []);
        setSelectedAccounts(connectionData.selectedAccounts || []);
        setAccessToken(connectionData.accessToken || '');
      }
    }
  };

  const handleConnectMeta = async () => {
    // Check if App ID is configured
    if (!FACEBOOK_APP_ID || FACEBOOK_APP_ID === 'SEU_APP_ID_AQUI') {
      setError('Facebook App ID not configured. See the CRIAR_FACEBOOK_APP.md file for instructions.');
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
        throw new Error('Popup blocked. Allow popups for this site.');
      }

      // Monitorar popup
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
          setError('Login cancelled by user');
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
      // Fetch user information
      const userResponse = await fetch(`https://graph.facebook.com/v23.0/me?access_token=${authData.access_token}`);
      const userData = await userResponse.json();

      // Set current user in multi-tenant system
      const currentUser = userService.setCurrentUser(userData, authData.access_token);

      // Fetch all ad accounts from Business Manager
      const accountsResponse = await fetch(
        `https://graph.facebook.com/v23.0/me/adaccounts?fields=id,name,currency,account_status,business&access_token=${authData.access_token}`
      );
      const accountsData = await accountsResponse.json();

      const connectionData = {
        accessToken: authData.access_token,
        userInfo: currentUser,
        adAccounts: accountsData.data || [],
        connectedAt: new Date().toISOString(),
        selectedAccounts: []
      };

      // Save user-specific data
      userService.saveUserData('connection_data', connectionData);
      
      // Migrate global data if it exists (for existing users)
      userService.migrateGlobalData();
      
      setIsConnected(true);
      setUserInfo(currentUser);
      setAdAccounts(connectionData.adAccounts);
      setAccessToken(authData.access_token);
      setIsConnecting(false);

      // Notify parent component
      if (onConnectionSuccess) {
        onConnectionSuccess(connectionData);
      }

    } catch (err) {
      setError('Error fetching Facebook data: ' + err.message);
      setIsConnecting(false);
    }
  };

  const handleAccountToggle = (accountId) => {
    setSelectedAccounts(prev => {
      const newSelected = prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId];
      
      // Update user data
      const connectionData = userService.getUserData('connection_data') || {};
      connectionData.selectedAccounts = newSelected;
      userService.saveUserData('connection_data', connectionData);
      
      return newSelected;
    });
  };

  const handleImportCampaigns = async () => {
    if (selectedAccounts.length === 0) {
      setError('Select at least one ad account to import campaigns');
      return;
    }

    setIsConnecting(true);
    try {
      const connectionData = userService.getUserData('connection_data');
      const accessToken = connectionData.accessToken;
      
      let allCampaigns = [];

      // Fetch campaigns from each selected ad account
      for (const accountId of selectedAccounts) {
        try {
          const campaignsResponse = await fetch(
            `https://graph.facebook.com/v23.0/${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,created_time&access_token=${accessToken}`
          );
          const campaignsData = await campaignsResponse.json();
          
          if (campaignsData.data) {
            // Fetch insights for each campaign
            const campaignsWithInsights = await Promise.all(
              campaignsData.data.map(async (campaign) => {
                try {
                  const insightsResponse = await fetch(
                    `https://graph.facebook.com/v23.0/${campaign.id}/insights?fields=spend,impressions,clicks,actions,cpc,cpm,ctr&date_preset=last_7d&access_token=${accessToken}`
                  );
                  const insightsData = await insightsResponse.json();
                  
                  const insights = insightsData.data && insightsData.data.length > 0 
                    ? insightsData.data[0] 
                    : {};

                  // Convert to platform format
                  return {
                    id: `fb_${campaign.id}`,
                    facebookCampaignId: campaign.id,
                    name: campaign.name,
                    adAccountId: accountId,
                    status: campaign.status,
                    objective: campaign.objective,
                    marketType: 'low_cpc', // User can adjust later
                    productName: campaign.name,
                    productPrice: 50, // User should configure
                    cogs: 20, // User should configure
                    currentBudget: parseFloat(campaign.daily_budget || campaign.lifetime_budget || 0) / 100,
                    initialBudget: 50,
                    createdAt: campaign.created_time,
                    dailyData: insights.spend ? [{
                      day: 1,
                      spend: parseFloat(insights.spend || 0),
                      sales: 0, // Will be calculated based on actions
                      atc: 0,
                      clicks: parseInt(insights.clicks || 0),
                      impressions: parseInt(insights.impressions || 0),
                      unitsSold: 0
                    }] : []
                  };
                } catch (err) {
                  console.error(`Error fetching insights for campaign ${campaign.id}:`, err);
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
          console.error(`Error fetching campaigns from account ${accountId}:`, err);
        }
      }

      // Save imported campaigns for current user
      const existingCampaigns = userService.getUserData('campaigns') || [];
      const existingIds = existingCampaigns.map(c => c.facebookCampaignId).filter(Boolean);
      const newCampaigns = allCampaigns.filter(c => !existingIds.includes(c.facebookCampaignId));
      
      const updatedCampaigns = [...existingCampaigns, ...newCampaigns];
      userService.saveUserData('campaigns', updatedCampaigns);

      setIsConnecting(false);
      alert(`${newCampaigns.length} campaigns imported successfully! Configure prices and COGS to activate automatic rules.`);

      // Reload page to show campaigns
      window.location.reload();

    } catch (err) {
      setError('Error importing campaigns: ' + err.message);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('Are you sure you want to disconnect from Meta?')) {
      userService.logout();
      setIsConnected(false);
      setUserInfo(null);
      setAdAccounts([]);
      setSelectedAccounts([]);
      setAccessToken('');
      
      // Reload page to clear state
      window.location.reload();
    }
  };

  if (isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* User Token Label */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta User Token Generated
          </label>
          {accessToken ? (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-2">
                Access token automatically generated by Meta during Business Manager connection
              </div>
              <div className="bg-white p-3 rounded border border-gray-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-green-600">Meta Token (Facebook Graph API)</span>
                  <span className="text-xs text-gray-500">
                    {accessToken.length} characters
                  </span>
                </div>
                <code className="text-xs text-gray-800 break-all block">
                  {accessToken}
                </code>
                <div className="mt-2 text-xs text-gray-500">
                  This token was obtained directly from Meta through the official OAuth process
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              Access token will be automatically generated after connecting to Meta Business Manager
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Meta Connected</h2>
              <p className="text-sm text-gray-600">
                Connected as {userInfo?.name}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleDisconnect}
            className="btn btn-danger"
          >
            Disconnect
          </button>
        </div>

        {/* Ad Accounts */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Your Ad Accounts ({adAccounts.length})
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
                        Status: {account.account_status === 1 ? 'Active' : 'Inactive'}
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
                Importing Campaigns...
              </>
            ) : (
              `Import Campaigns (${selectedAccounts.length} accounts)`
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 p-4 rounded-lg">
            <div className="flex items-center text-red-800">
              <AlertCircle size={16} className="mr-2" />
              <span className="font-medium">Error:</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* User Token Label */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta User Token Generated
        </label>
        <div className="text-xs text-gray-500">
          Access token will be automatically generated after connecting to Meta Business Manager
        </div>
      </div>
      
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Link className="text-white" size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Connect Meta Business Manager
        </h2>
        
        <p className="text-gray-600 mb-6">
          Connect your Business Manager to automatically import all your ad accounts and campaigns
        </p>

        <button
          onClick={handleConnectMeta}
          disabled={isConnecting}
          className="btn btn-primary text-lg px-8 py-3"
        >
          {isConnecting ? (
            <>
              <RefreshCw size={20} className="animate-spin mr-3" />
              Connecting...
            </>
          ) : (
            <>
              <Link size={20} className="mr-3" />
              Connect Meta
            </>
          )}
        </button>

        {error && (
          <div className="mt-6 bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-center text-red-800">
              <AlertCircle size={16} className="mr-2" />
              <span className="font-medium">Error:</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Configuration instructions */}
        {(!FACEBOOK_APP_ID || FACEBOOK_APP_ID === 'SEU_APP_ID_AQUI') && (
          <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg text-left">
            <h4 className="font-semibold text-orange-800 mb-3">🔧 Configuration Required</h4>
            <div className="bg-orange-100 p-3 rounded mb-3">
              <p className="text-orange-800 text-sm mb-2">
                <strong>Facebook App ID not configured.</strong>
              </p>
              <p className="text-orange-700 text-sm">
                To connect to your Business Manager, you need to create your own Facebook App.
              </p>
            </div>
            
            <h5 className="font-semibold text-orange-800 mb-2">Quick steps (10 minutes):</h5>
            <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
              <li>Acesse <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="underline font-medium">developers.facebook.com/apps</a></li>
              <li>Create new "Business" app</li>
              <li>Add "Marketing API" and "Facebook Login"</li>
              <li>Configure redirect URI: <code className="bg-white px-1 rounded text-xs">http://localhost:3000/meta-callback</code></li>
              <li>Copy your App ID and configure in code</li>
            </ol>
            
            <div className="mt-3 p-2 bg-white rounded border border-orange-300">
              <p className="text-orange-800 text-xs">
                📋 <strong>Complete guide:</strong> See the <code>CRIAR_FACEBOOK_APP.md</code> file in the project root
              </p>
            </div>
          </div>
        )}

        {/* Normal instructions */}
        {FACEBOOK_APP_ID && FACEBOOK_APP_ID !== 'SEU_APP_ID_AQUI' && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left">
            <h4 className="font-semibold text-blue-800 mb-2">What happens:</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Secure Facebook login</li>
              <li>Access to your Business Manager</li>
              <li>Lists all your ad accounts</li>
              <li>Imports campaigns automatically</li>
              <li>Applies automatic rules to real data</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaConnector;