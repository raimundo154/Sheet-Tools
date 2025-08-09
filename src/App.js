import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import NewHomePage from './components/NewHomePage';
import CampaignDashboard from './components/CampaignDashboard';
import FacebookTestCalls from './components/FacebookTestCalls';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import EmailVerification from './components/EmailVerification';
import AuthCallback from './components/AuthCallback';
import authService from './services/authService';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [showTestCalls, setShowTestCalls] = useState(false);

  // Verificar rotas baseadas na URL
  const currentPath = window.location.pathname;
  const isAuthCallback = currentPath === '/auth/callback';
  const isSignupPage = currentPath === '/signup';
  const isVerificationPage = currentPath === '/verify-email';

  const handlePageChange = (pageId) => {
    setCurrentPage(pageId);
  };

  const handleLogin = (user) => {
    setCurrentPage('home');
    console.log('Usuário logado:', user);
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setCurrentPage('login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Forçar logout mesmo se houver erro
      setCurrentPage('login');
    }
  };

  const handleAuthError = (error) => {
    console.error('Erro na autenticação:', error);
    setCurrentPage('login');
  };

  const handleSignupRequest = (signupData) => {
    console.log('Código enviado para:', signupData.email);
    // Redirecionar para página de verificação
    window.history.pushState({}, '', '/verify-email');
    setCurrentPage('verify-email');
  };

  const handleVerificationSuccess = (user) => {
    console.log('Conta criada com sucesso:', user);
    setCurrentPage('home');
    // Limpar URL
    window.history.pushState({}, '', '/');
  };

  const handleBackToLogin = () => {
    window.history.pushState({}, '', '/');
    setCurrentPage('login');
  };

  const handleBackToSignup = () => {
    window.history.pushState({}, '', '/signup');
    setCurrentPage('signup');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'signup':
        return <SignupPage onSignupRequest={handleSignupRequest} onBackToLogin={handleBackToLogin} />;
      case 'verify-email':
        return <EmailVerification onVerificationSuccess={handleVerificationSuccess} onBackToSignup={handleBackToSignup} />;
      case 'home-landing':
        return <NewHomePage />;
      case 'home':
        return <HomePage />;
      case 'campaigns':
        return <CampaignDashboard />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsOfService />;
      default:
        return <NewHomePage />;
    }
  };

  // Inicializar página baseada na URL
  React.useEffect(() => {
    if (isSignupPage) {
      setCurrentPage('signup');
    } else if (isVerificationPage) {
      setCurrentPage('verify-email');
    } else if (!isAuthCallback) {
      setCurrentPage('home-landing');
    }
  }, [isSignupPage, isVerificationPage, isAuthCallback]);

  // Se estiver na página de callback de autenticação
  if (isAuthCallback) {
    return (
      <div className="App">
        <AuthCallback 
          onAuthSuccess={handleLogin}
          onAuthError={handleAuthError}
        />
      </div>
    );
  }

  // Se estiver nas páginas de autenticação ou landing, renderiza apenas essas páginas
  if (currentPage === 'login' || currentPage === 'signup' || currentPage === 'verify-email' || currentPage === 'home-landing') {
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
        {/* Botão para mostrar/esconder testes (só no dashboard) */}
        {currentPage === 'campaigns' && (
          <div className="test-button-container">
            <button 
              onClick={() => setShowTestCalls(!showTestCalls)}
              className="test-button"
            >
              {showTestCalls ? '❌ Fechar Testes' : '🧪 Testes Facebook'}
            </button>
          </div>
        )}

        {/* Componente de testes (condicional) */}
        {showTestCalls && currentPage === 'campaigns' && (
          <div className="test-panel">
            <FacebookTestCalls />
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;