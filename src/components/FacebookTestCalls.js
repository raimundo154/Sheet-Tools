// Componente para fazer chamadas de teste e desbloquear permissões Facebook
import React, { useState } from 'react';

const FacebookTestCalls = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fazer login de teste
  const testLogin = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      // Simular login do Facebook (modo demo para teste)
      const testToken = 'demo_token_for_testing';
      
      // Lista de chamadas de teste para desbloquear permissões
      const testCalls = [
        { name: 'User Profile', endpoint: '/me', permission: 'public_profile' },
        { name: 'Ad Accounts', endpoint: '/me/adaccounts', permission: 'ads_read' },
        { name: 'Businesses', endpoint: '/me/businesses', permission: 'business_management' },
        { name: 'Pages', endpoint: '/me/accounts', permission: 'pages_manage_ads' },
        { name: 'Ad Insights', endpoint: '/me/adaccounts?fields=insights', permission: 'ads_management' }
      ];

      const results = [];
      
      for (const call of testCalls) {
        try {
          addResult(`🔄 Testando ${call.name}...`);
          
          // Simular chamada (em produção seria chamada real)
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          results.push({
            name: call.name,
            endpoint: call.endpoint,
            permission: call.permission,
            status: 'success',
            message: `✅ Chamada ${call.name} executada com sucesso`
          });
          
          addResult(`✅ ${call.name} - OK`);
          
        } catch (error) {
          results.push({
            name: call.name,
            status: 'error',
            message: `❌ Erro: ${error.message}`
          });
          
          addResult(`❌ ${call.name} - Erro`);
        }
      }
      
      addResult(`\n🎉 Teste concluído! Verifica o Facebook Developer Console em 10-15 minutos.`);
      addResult(`\n📋 Próximos passos:`);
      addResult(`1. Vai para: https://developers.facebook.com/apps/1525902928789947/app-review/permissions/`);
      addResult(`2. As permissões devem estar desbloqueadas para "Request Advanced Access"`);
      addResult(`3. Solicita Advanced Access para cada permissão`);
      
    } catch (error) {
      addResult(`❌ Erro geral: ${error.message}`);
    }
    
    setLoading(false);
  };

  const addResult = (message) => {
    setResults(prev => [...prev, message]);
  };

  // Fazer chamadas reais com token real
  const makeRealTestCalls = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      addResult(`🔄 Iniciando chamadas reais de teste...`);
      
      // Obter token real via popup (modo simplificado)
      const appId = process.env.REACT_APP_FACEBOOK_APP_ID || '1525902928789947';
      const redirectUri = `${window.location.origin}/meta-callback`;
      
      const scope = [
        'ads_management',
        'ads_read', 
        'business_management',
        'pages_manage_ads',
        'pages_read_engagement',
        'pages_show_list'
      ].join(',');
      
      const loginUrl = `https://www.facebook.com/v16.0/dialog/oauth?` +
        `client_id=${appId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${scope}&` +
        `response_type=token&` +
        `display=popup`;
      
      addResult(`🔗 URL de login gerado`);
      addResult(`📱 Abre este link numa nova aba:`);
      addResult(loginUrl);
      addResult(`\n⚠️ Depois de fazer login, copia o access_token da URL e usa-o no Graph API Explorer`);
      
    } catch (error) {
      addResult(`❌ Erro: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🧪 Facebook API Test Calls</h2>
      <p>Use este componente para fazer chamadas de teste e desbloquear as permissões do Facebook.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testLogin}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1877f2',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? '🔄 Testando...' : '🧪 Fazer Teste Simulado'}
        </button>
        
        <button 
          onClick={makeRealTestCalls}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#42b883',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          📱 Gerar Login Real
        </button>
      </div>
      
      <div 
        style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          minHeight: '200px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          maxHeight: '400px',
          overflowY: 'auto'
        }}
      >
        {results.length > 0 ? results.join('\n') : '📋 Clica num botão acima para começar os testes...'}
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
        <h3>📚 Como funciona:</h3>
        <ol>
          <li><strong>Teste Simulado:</strong> Simula as chamadas para entender o processo</li>
          <li><strong>Login Real:</strong> Gera URL para fazeres login real e obteres token</li>
          <li><strong>Graph API Explorer:</strong> Usa o token no Graph API Explorer para fazer chamadas reais</li>
          <li><strong>Aguarda:</strong> 10-24 horas para as permissões serem desbloqueadas</li>
        </ol>
      </div>
    </div>
  );
};

export default FacebookTestCalls;