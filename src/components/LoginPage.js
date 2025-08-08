import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Inicializar o serviço de autenticação
    const initAuth = async () => {
      try {
        const session = await authService.initialize();
        if (session && session.user) {
          // Usuário já está logado
          onLogin && onLogin(session.user);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      }
    };

    initAuth();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        onLogin && onLogin(session.user);
      } else if (event === 'SIGNED_OUT') {
        // Usuário fez logout - limpar estado
        console.log('Usuário deslogado');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [onLogin]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await authService.signInWithGoogle();
      // O redirecionamento será tratado automaticamente pelo Supabase
    } catch (error) {
      console.error('Erro no login com Google:', error);
      setError(error.message || 'Erro ao fazer login com Google');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Painel Esquerdo - Logo */}
      <div className="login-left-panel">
        <div className="logo-container">
          <img 
            src="/logo/sheet-tools-logo-backgroundremover.png" 
            alt="Sheet Tools" 
            className="login-logo"
          />
        </div>
      </div>

      {/* Painel Direito - Formulário */}
      <div className="login-right-panel">
        <div className="login-form-container">
          <div className="login-header">
            <h1 className="login-title">SIGN IN</h1>
            <p className="login-subtitle">Faça login com sua conta Google</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="social-buttons">
            <button 
              className="social-button google-button"
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Conectando...' : 'Continuar com Google'}
            </button>
          </div>

          <div className="login-footer">
            <p className="terms-text">
              Ao fazer login, você concorda com nossos{' '}
              <button type="button" className="terms-link">Termos e Condições</button>
            </p>
            <p className="signup-text">
              Não tem uma conta?{' '}
              <button 
                type="button" 
                className="signup-link"
                onClick={() => window.location.href = '/signup'}
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
