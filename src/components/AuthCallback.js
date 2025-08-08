import React, { useEffect, useState } from 'react';
import authService from '../services/authService';

const AuthCallback = ({ onAuthSuccess, onAuthError }) => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Processando autenticação...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // O Supabase automaticamente processa o callback
        // Apenas precisamos verificar se o usuário foi autenticado
        const session = await authService.initialize();
        
        if (session && session.user) {
          setMessage('Login realizado com sucesso! Redirecionando...');
          setTimeout(() => {
            onAuthSuccess && onAuthSuccess(session.user);
          }, 1500);
        } else {
          throw new Error('Falha na autenticação');
        }
      } catch (error) {
        console.error('Erro no callback de autenticação:', error);
        setMessage('Erro na autenticação. Tente novamente.');
        onAuthError && onAuthError(error);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [onAuthSuccess, onAuthError]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#1e3a3a',
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif'
    }}>
      {loading && (
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #4a9bb8',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }} />
      )}
      <p style={{
        fontSize: '1.1rem',
        textAlign: 'center',
        margin: 0
      }}>
        {message}
      </p>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthCallback;
