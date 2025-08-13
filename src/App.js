import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import NewHomePage from './components/NewHomePage';
import CampaignDashboard from './components/CampaignDashboard';

import QuotationPage from './components/QuotationPage';
import DailyRoasPageNew from './components/DailyRoasPageNew';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import EmailVerification from './components/EmailVerification';
import AuthCallback from './components/AuthCallback';
import authService from './services/authService';
import NavigationService, { ROUTES, navigation } from './utils/navigation';
import './styles/GlobalDesignSystem.css';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home-landing');

  // Inicializar página baseada na URL atual
  useEffect(() => {
    const initializePage = () => {
      const currentPageName = navigation.getCurrentPageName();
      setCurrentPage(currentPageName);
    };

    initializePage();

    // Escutar eventos de navegação customizados
    const handleNavigation = (event) => {
      const newPageName = navigation.getCurrentPageName();
      setCurrentPage(newPageName);
    };

    window.addEventListener('navigation', handleNavigation);
    window.addEventListener('popstate', initializePage); // Botão voltar do navegador

    return () => {
      window.removeEventListener('navigation', handleNavigation);
      window.removeEventListener('popstate', initializePage);
    };
  }, []);

  // Navegação entre páginas da aplicação (sidebar)
  const handlePageChange = (pageId) => {
    const routeMap = {
      'dashboard': ROUTES.DASHBOARD,
      'campaigns': ROUTES.CAMPAIGNS,
      'sales': ROUTES.SALES,
      'quotation': ROUTES.QUOTATION,
      'daily-roas': ROUTES.DAILY_ROAS,
      'privacy': ROUTES.PRIVACY,
      'terms': ROUTES.TERMS,
    };
    
    const route = routeMap[pageId];
    if (route) {
      NavigationService.navigate(route);
    }
  };

  // Handlers de autenticação
  const handleLogin = (user) => {
    console.log('Usuário logado:', user);
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
      case 'dashboard':
        return <HomePage />;
      case 'campaigns':
        return <CampaignDashboard />;
      case 'sales':
        return <QuotationPage />;
      case 'quotation':
        return <QuotationPage />;
      case 'daily-roas':
        return <DailyRoasPageNew />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsOfService />;
      default:
        return <NewHomePage />;
    }
  };

  // Determinar se deve mostrar sidebar baseado na página atual
  const isStandalonePage = navigation.isAuthRoute() || navigation.isHomePage() || currentPage === 'auth-callback';

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
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} onSignOut={handleSignOut} />
      
      {/* Main Content */}
      <main className="main-content">

        {/* Conteúdo principal */}
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;