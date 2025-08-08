// Componente de cadastro com verificação por email
// Este componente permite ao usuário inserir seu email e solicitar um código de verificação

import React, { useState } from 'react';
import emailService from '../services/emailService';
import './SignupPage.css';

const SignupPage = ({ onSignupRequest, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Validar formato do email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função para enviar código de verificação
  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validações
      if (!email.trim()) {
        throw new Error('Por favor, insira seu email');
      }

      if (!validateEmail(email.trim())) {
        throw new Error('Por favor, insira um email válido');
      }

      // Verificar se o serviço de email está configurado
      if (!emailService.isConfigured()) {
        throw new Error(
          'Serviço de email não configurado. Entre em contato com o administrador.'
        );
      }

      // Gerar código de verificação
      const verificationCode = emailService.generateVerificationCode();
      
      // Enviar email com código
      const result = await emailService.sendVerificationEmail(
        email.trim(), 
        verificationCode
      );

      if (result.success) {
        // Salvar dados temporários para verificação
        const signupData = {
          email: email.trim(),
          verificationCode: verificationCode,
          timestamp: Date.now(),
          // Código expira em 10 minutos
          expiresAt: Date.now() + (10 * 60 * 1000)
        };

        // Salvar no localStorage temporariamente
        localStorage.setItem('pendingSignup', JSON.stringify(signupData));

        setSuccess('Código enviado com sucesso! Verifique seu email.');
        
        // Chamar callback para navegar para página de verificação
        if (onSignupRequest) {
          onSignupRequest({
            email: email.trim(),
            verificationCode: verificationCode
          });
        }

      } else {
        throw new Error('Falha ao enviar código. Tente novamente.');
      }

    } catch (error) {
      console.error('Erro ao enviar código:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para testar configuração de email (para desenvolvimento)
  const handleTestEmailConfig = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await emailService.testEmailConfiguration();
      
      if (result.success) {
        setSuccess('✅ Configuração de email está funcionando!');
      } else {
        setError(`❌ Erro na configuração: ${result.message}`);
      }
      
    } catch (error) {
      setError(`❌ Erro ao testar configuração: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {/* Painel Esquerdo - Logo */}
      <div className="signup-left-panel">
        <div className="logo-container">
          <img 
            src="/logo/sheet-tools-logo-backgroundremover.png" 
            alt="Sheet Tools" 
            className="signup-logo"
          />
        </div>
      </div>

      {/* Painel Direito - Formulário */}
      <div className="signup-right-panel">
        <div className="signup-form-container">
          <div className="signup-header">
            <h1 className="signup-title">CRIAR CONTA</h1>
            <p className="signup-subtitle">
              Insira seu email para receber um código de verificação
            </p>
          </div>

          <form onSubmit={handleSendVerificationCode} className="signup-form">
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
                placeholder="seu-email@gmail.com"
                className="email-input"
                disabled={loading}
                required
              />
            </div>

            {/* Mensagens de erro e sucesso */}
            {error && (
              <div className="error-message">
                {error}
                {error.includes('não configurado') && (
                  <div className="config-help">
                    <p>💡 Para configurar o envio de emails:</p>
                    <ol>
                      <li>Crie um arquivo .env na raiz do projeto</li>
                      <li>Adicione suas credenciais de email</li>
                      <li>Reinicie o servidor</li>
                    </ol>
                    <button 
                      type="button" 
                      onClick={handleTestEmailConfig}
                      className="test-config-button"
                      disabled={loading}
                    >
                      🧪 Testar Configuração
                    </button>
                  </div>
                )}
              </div>
            )}

            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            <button 
              type="submit" 
              className="send-code-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Enviando código...
                </>
              ) : (
                'Enviar Código de Verificação'
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="separator">
            <span className="separator-text">Ou continue com</span>
          </div>

          {/* Botão Google (mantido da página de login) */}
          <div className="social-buttons">
            <button 
              className="social-button google-button"
              onClick={() => window.location.href = '/login'} // Redirecionar para login com Google
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>
          </div>

          {/* Footer */}
          <div className="signup-footer">
            <p className="terms-text">
              Ao criar uma conta, você concorda com nossos{' '}
              <button type="button" className="terms-link">Termos e Condições</button>
            </p>
            <p className="signin-text">
              Já tem uma conta?{' '}
              <button 
                type="button" 
                className="signin-link"
                onClick={onBackToLogin}
              >
                Fazer login
              </button>
            </p>
          </div>

          {/* Informações para desenvolvimento */}
          {process.env.NODE_ENV === 'development' && (
            <div className="dev-info">
              <h4>🔧 Informações de Desenvolvimento</h4>
              <p><strong>Configuração de Email:</strong> {emailService.isConfigured() ? '✅ Configurado' : '❌ Não configurado'}</p>
              <p><strong>Serviço:</strong> {process.env.REACT_APP_EMAIL_SERVICE || 'Não definido'}</p>
              <p><strong>Email:</strong> {process.env.REACT_APP_EMAIL_USER || 'Não definido'}</p>
              <button 
                onClick={handleTestEmailConfig}
                className="test-config-button"
                disabled={loading}
              >
                🧪 Testar Configuração de Email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

/*
FLUXO DO COMPONENTE:

1. Usuário insere email
2. Clica em "Enviar Código de Verificação"
3. Sistema gera código de 8 dígitos
4. Email é enviado com o código
5. Dados são salvos temporariamente no localStorage
6. Usuário é redirecionado para página de verificação

DADOS SALVOS NO LOCALSTORAGE:
{
  email: "user@example.com",
  verificationCode: "12345678",
  timestamp: 1234567890,
  expiresAt: 1234567890 + 600000  // 10 minutos
}
*/
