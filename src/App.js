import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import CampaignDashboard from './components/CampaignDashboard';
import FacebookTestCalls from './components/FacebookTestCalls';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import LoginPage from './components/LoginPage';
import AuthCallback from './components/AuthCallback';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [showTestCalls, setShowTestCalls] = useState(false);

  // Verificar se estamos na página de callback
  const isAuthCallback = window.location.pathname === '/auth/callback';

  const handlePageChange = (pageId) => {
    setCurrentPage(pageId);
  };

  const handleLogin = (user) => {
    setCurrentPage('home');
    console.log('Usuário logado:', user);
  };

  const handleSignOut = async () => {
    try {
      const authService = await import('./services/authService');
      await authService.default.signOut();
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

  const renderContent = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'home':
        return <HomePage />;
      case 'campaigns':
        return <CampaignDashboard />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsOfService />;
      default:
        return <HomePage />;
    }
  };

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

  // Se estiver na página de login, renderiza apenas o login
  if (currentPage === 'login') {
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