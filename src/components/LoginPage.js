import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import EmailVerification from './EmailVerification';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email.trim()) {
        throw new Error('Por favor, insira seu email');
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error('Por favor, insira um email válido');
      }

      await authService.signInWithMagicLink(email.trim());
      setPendingEmail(email.trim());
      setShowVerification(true);
    } catch (error) {
      console.error('Erro ao enviar magic link:', error);
      setError(error.message || 'Erro ao enviar link de verificação');
    } finally {
      setLoading(false);
    }
  };

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

  const handleVerificationSuccess = (user) => {
    setShowVerification(false);
    onLogin && onLogin(user);
  };

  const handleBackToLogin = () => {
    setShowVerification(false);
    setPendingEmail('');
    setEmail('');
    setError('');
  };

    // Se estiver na tela de verificação de email
  if (showVerification) {
    return (
      <EmailVerification
        email={pendingEmail}
        onVerificationSuccess={handleVerificationSuccess}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

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
            <p className="login-subtitle">Sign in with email address</p>
          </div>

          <form onSubmit={handleEmailSubmit} className="login-form">
            <div className="email-input-container">
              <div className="email-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" 
                    stroke="#9CA3AF" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <polyline 
                    points="22,6 12,13 2,6" 
                    stroke="#9CA3AF" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@gmail.com"
                className="email-input"
                disabled={loading}
                required
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
                {error.includes('temporariamente indisponível') && (
                  <div className="error-suggestion">
                    💡 Sugestão: Use o botão "Continuar com Google" abaixo
                  </div>
                )}
              </div>
            )}

            <button 
              type="submit" 
              className="signup-button"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar código de verificação'}
            </button>
          </form>

          <div className="separator">
            <span className="separator-text">Or continue with</span>
          </div>

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
            </button>
          </div>

          <div className="login-footer">
            <p className="terms-text">
              Ao se registrar, você concorda com nossos{' '}
              <button type="button" className="terms-link">Termos e Condições</button>
            </p>
            <p className="signin-text">
              Já tem uma conta?{' '}
              <button type="button" className="signin-link">faça login aqui</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
