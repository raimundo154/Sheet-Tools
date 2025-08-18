import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import NewHomePage from './components/NewHomePage';
import CampaignDashboard from './components/CampaignDashboard';
import SettingsPage from './components/SettingsPage';
import QuotationPage from './components/QuotationPage';
import DailyRoasPageNew from './components/DailyRoasPageNew';
import ProfitSheet from './components/ProfitSheet';
import ProductResearch from './components/ProductResearch';
import SubscriptionPage from './components/SubscriptionPage';

import ProtectedRoute from './components/ProtectedRoute';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import EmailVerification from './components/EmailVerification';
import AuthCallback from './components/AuthCallback';
import HelpChatBot from './components/HelpChatBot';
import authService from './services/authService';
import NavigationService, { ROUTES, navigation } from './utils/navigation';
import './styles/GlobalDesignSystem.css';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home-landing');
  const [isHelpChatOpen, setIsHelpChatOpen] = useState(false);

  // Inicializar página baseada na URL atual e autenticação
  useEffect(() => {
    const initializeApp = async () => {
      // Inicializar authService para verificar sessão existente
      try {
        const session = await authService.initialize();
        if (session && session.user) {
          console.log('Sessão existente encontrada:', session.user.email);
          authService.user = session.user;
          authService.session = session;
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
      }

      // Definir página inicial
      const currentPageName = navigation.getCurrentPageName();
      setCurrentPage(currentPageName);
    };

    initializeApp();

    // Escutar eventos de navegação customizados
    const handleNavigation = (event) => {
      const newPageName = navigation.getCurrentPageName();
      setCurrentPage(newPageName);
    };

    window.addEventListener('navigation', handleNavigation);
    window.addEventListener('popstate', () => {
      const currentPageName = navigation.getCurrentPageName();
      setCurrentPage(currentPageName);
    });

    return () => {
      window.removeEventListener('navigation', handleNavigation);
      window.removeEventListener('popstate', () => {
        const currentPageName = navigation.getCurrentPageName();
        setCurrentPage(currentPageName);
      });
    };
  }, []);

  // Navegação entre páginas da aplicação (sidebar)
  const handlePageChange = (pageId) => {
    console.log('🔄 App.js - handlePageChange called with:', pageId);
    
    const routeMap = {
      'dashboard': ROUTES.DASHBOARD,
      'subscription': ROUTES.SUBSCRIPTION,
      'rank-up': ROUTES.RANK_UP,
      'settings': ROUTES.SETTINGS,
      'campaigns': ROUTES.CAMPAIGNS,
      'sales': ROUTES.SALES,
      'quotation': ROUTES.QUOTATION,
      'daily-roas': ROUTES.DAILY_ROAS,
      'profit-sheet': ROUTES.PROFIT_SHEET,
      'product-research': ROUTES.PRODUCT_RESEARCH,
      'privacy': ROUTES.PRIVACY,
      'terms': ROUTES.TERMS,
    };
    
    const route = routeMap[pageId];
    console.log('🎯 App.js - Mapped route:', route);
    
    if (route) {
      console.log('✅ App.js - Navigating to:', route);
      NavigationService.navigate(route);
    } else {
      console.error('❌ App.js - No route found for pageId:', pageId);
    }
  };

  // Handlers de autenticação
  const handleLogin = (user) => {
    console.log('Usuário logado:', user);
    // Garantir que o authService tem o user atualizado
    authService.user = user;
    navigation.redirectAfterLogin();
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigation.redirectAfterLogout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Forçar logout mesmo se houver erro
      navigation.redirectAfterLogout();
    }
  };

  const handleAuthError = (error) => {
    console.error('Erro na autenticação:', error);
    navigation.toLogin();
  };

  // Handlers do fluxo de cadastro
  const handleSignupRequest = (signupData) => {
    console.log('Código enviado para:', signupData.email);
    navigation.redirectAfterSignup();
  };

  const handleVerificationSuccess = (user) => {
    console.log('Conta criada com sucesso:', user);
    navigation.redirectAfterVerification();
  };

  const handleBackToLogin = () => {
    navigation.toLogin();
  };

  const handleBackToSignup = () => {
    navigation.toSignup();
  };

  const handleOpenHelp = () => {
    setIsHelpChatOpen(true);
  };

  const handleCloseHelp = () => {
    setIsHelpChatOpen(false);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'signup':
        return <SignupPage onSignupRequest={handleSignupRequest} onBackToLogin={handleBackToLogin} />;
      case 'verify-email':
        return <EmailVerification onVerificationSuccess={handleVerificationSuccess} onBackToSignup={handleBackToSignup} />;
      case 'auth-callback':
        return <AuthCallback onAuthSuccess={handleLogin} onAuthError={handleAuthError} />;
      case 'home-landing':
        return <NewHomePage />;
      case 'subscription':
        return <SubscriptionPage />;
      case 'dashboard':
        return <HomePage />;
      case 'campaigns':
        return (
          <ProtectedRoute pageName="campaigns" requiredFeature="Campaigns">
            <CampaignDashboard />
          </ProtectedRoute>
        );
      case 'sales':
        return (
          <ProtectedRoute pageName="quotation" requiredFeature="Quotation">
            <QuotationPage />
          </ProtectedRoute>
        );
      case 'quotation':
        return (
          <ProtectedRoute pageName="quotation" requiredFeature="Quotation">
            <QuotationPage />
          </ProtectedRoute>
        );
      case 'daily-roas':
        return (
          <ProtectedRoute pageName="daily-roas" requiredFeature="Daily ROAS Profit Sheet">
            <DailyRoasPageNew />
          </ProtectedRoute>
        );
      case 'profit-sheet':
        return (
          <ProtectedRoute pageName="profit-sheet" requiredFeature="Daily ROAS Profit Sheet">
            <ProfitSheet />
          </ProtectedRoute>
        );
      case 'product-research':
        return (
          <ProtectedRoute pageName="product-research" requiredFeature="Product Research">
            <ProductResearch />
          </ProtectedRoute>
        );
      case 'rank-up':
        return <div style={{padding: '2rem', textAlign: 'center', color: '#ffffff'}}>
          <h1>🚀 Rank Up</h1>
          <p>Página em desenvolvimento...</p>
        </div>;
      case 'settings':
        return <SettingsPage />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsOfService />;
      default:
        return <NewHomePage />;
    }
  };

  // Determinar se deve mostrar sidebar baseado na página atual
  const isStandalonePage = navigation.isAuthRoute() || navigation.isHomePage() || currentPage === 'auth-callback' || currentPage === 'subscription';

  // Renderização condicional baseada no tipo de página
  if (isStandalonePage) {
    return (
      <div className="App">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="App">
      {/* Sidebar */}
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={handlePageChange} 
        onSignOut={handleSignOut}
        onOpenHelp={handleOpenHelp}
      />
      
      {/* Main Content */}
      <main className="main-content">

        {/* Conteúdo principal */}
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>

      {/* Help Chat Bot */}
      <HelpChatBot 
        isOpen={isHelpChatOpen}
        onClose={handleCloseHelp}
      />
    </div>
  );
}

export default App;