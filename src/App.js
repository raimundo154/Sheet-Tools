import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import CampaignDashboard from './components/CampaignDashboard';
import FacebookTestCalls from './components/FacebookTestCalls';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showTestCalls, setShowTestCalls] = useState(false);

  const handlePageChange = (pageId) => {
    setCurrentPage(pageId);
  };

  const renderContent = () => {
    switch (currentPage) {
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

  return (
    <div className="App">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
      
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