import React, { useState } from 'react';
import CampaignDashboard from './components/CampaignDashboard';
import FacebookTestCalls from './components/FacebookTestCalls';
import './App.css';

function App() {
  const [showTestCalls, setShowTestCalls] = useState(false);

  return (
    <div className="App">
      {/* Botão para mostrar/esconder testes */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000 }}>
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

      {/* Componente de testes (condicional) */}
      {showTestCalls && (
        <div style={{
          position: 'fixed',
          top: '50px',
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

      {/* Aplicação principal */}
      <CampaignDashboard />
    </div>
  );
}

export default App;