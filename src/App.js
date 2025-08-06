import React, { useState } from 'react';
import CampaignDashboard from './components/CampaignDashboard';
import FacebookTestCalls from './components/FacebookTestCalls';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import './App.css';

function App() {
  const [showTestCalls, setShowTestCalls] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'privacy', or 'terms'

  // Verificar se está na rota específica
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path === '/privacy' || path === '/privacy-policy') {
      setCurrentPage('privacy');
    } else if (path === '/terms' || path === '/terms-of-service') {
      setCurrentPage('terms');
    }
  }, []);

  const navigateToPrivacy = () => {
    setCurrentPage('privacy');
    window.history.pushState(null, '', '/privacy-policy');
  };

  const navigateToTerms = () => {
    setCurrentPage('terms');
    window.history.pushState(null, '', '/terms-of-service');
  };

  const navigateToDashboard = () => {
    setCurrentPage('dashboard');
    window.history.pushState(null, '', '/');
  };

  return (
    <div className="App">
      {/* Navigation Bar */}
      <nav style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '10px 20px', 
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <button 
            onClick={navigateToDashboard}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#007bff',
              cursor: 'pointer'
            }}
          >
            Sheet Tools
          </button>
        </div>
        <div>
          <button 
            onClick={navigateToPrivacy}
            style={{
              background: 'none',
              border: 'none',
              color: '#6c757d',
              cursor: 'pointer',
              marginRight: '15px'
            }}
          >
            Privacy Policy
          </button>
          <button 
            onClick={navigateToTerms}
            style={{
              background: 'none',
              border: 'none',
              color: '#6c757d',
              cursor: 'pointer',
              marginRight: '15px'
            }}
          >
            Terms of Service
          </button>
        </div>
      </nav>

      {/* Botão para mostrar/esconder testes (só no dashboard) */}
      {currentPage === 'dashboard' && (
        <div style={{ position: 'fixed', top: '70px', right: '10px', zIndex: 1000 }}>
          <button 
            onClick={() => setShowTestCalls(!showTestCalls)}
            style={{
              padding: '8px 12px',
              backgroundColor: showTestCalls ? '#f44336' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {showTestCalls ? '❌ Fechar Testes' : '🧪 Testes Facebook'}
          </button>
        </div>
      )}

      {/* Componente de testes (condicional) */}
      {showTestCalls && currentPage === 'dashboard' && (
        <div style={{
          position: 'fixed',
          top: '110px',
          right: '10px',
          width: '400px',
          maxHeight: '80vh',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 999,
          overflow: 'hidden'
        }}>
          <FacebookTestCalls />
        </div>
      )}

      {/* Conteúdo principal */}
      {currentPage === 'dashboard' && <CampaignDashboard />}
      {currentPage === 'privacy' && <PrivacyPolicy />}
      {currentPage === 'terms' && <TermsOfService />}
    </div>
  );
}

export default App;