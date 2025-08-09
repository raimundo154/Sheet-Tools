// Componente de verificação de código enviado por email
// Este componente permite ao usuário inserir o código de 8 dígitos recebido por email

import React, { useState, useEffect } from 'react';
import emailService from '../services/emailService';
import authService from '../services/authService';

const EmailVerification = ({ onVerificationSuccess, onBackToSignup }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [signupData, setSignupData] = useState(null);

  useEffect(() => {
    // Carregar dados do cadastro pendente
    const pendingData = localStorage.getItem('pendingSignup');
    if (pendingData) {
      const data = JSON.parse(pendingData);
      setSignupData(data);
      
      // Calcular tempo restante
      const now = Date.now();
      const remaining = Math.max(0, data.expiresAt - now);
      setTimeLeft(Math.floor(remaining / 1000));
      
      // Se expirou, limpar dados
      if (remaining <= 0) {
        localStorage.removeItem('pendingSignup');
        setError('Code expired. Request a new code.');
      }
    } else {
      setError('No pending code. Request a new code.');
    }
  }, []);

  // Contador regressivo
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && signupData) {
      // Código expirou
      localStorage.removeItem('pendingSignup');
      setError('Code expired. Request a new code.');
    }
  }, [timeLeft, signupData]);

  // Verificar código inserido
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validações
      if (!verificationCode.trim()) {
        throw new Error('Please enter the verification code');
      }

      if (verificationCode.trim().length !== 8) {
        throw new Error('The code must have 8 digits');
      }

      if (!signupData) {
        throw new Error('Verification data not found. Request a new code.');
      }

      // Verificar se o código não expirou
      if (Date.now() > signupData.expiresAt) {
        localStorage.removeItem('pendingSignup');
        throw new Error('Code expired. Request a new code.');
      }

      // Verificar se o código está correto
      if (verificationCode.trim() !== signupData.verificationCode) {
        throw new Error('Incorrect code. Please check and try again.');
      }

      // Código correto! Criar conta no Supabase
      const result = await authService.createAccountWithEmail(signupData.email);
      
      if (result.user) {
        // Limpar dados temporários
        localStorage.removeItem('pendingSignup');
        
        // Chamar callback de sucesso
        onVerificationSuccess && onVerificationSuccess(result.user);
      } else {
        throw new Error('Error creating account. Please try again.');
      }

    } catch (error) {
      console.error('Erro na verificação:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código
  const handleResendCode = async () => {
    setResendLoading(true);
    setResendMessage('');
    setError('');

    try {
      if (!signupData || !signupData.email) {
        throw new Error('Email not found. Go back and enter your email again.');
      }

      // Gerar novo código
      const newVerificationCode = emailService.generateVerificationCode();
      
      // Enviar novo email
      const result = await emailService.sendVerificationEmail(
        signupData.email, 
        newVerificationCode
      );

      if (result.success) {
        // Atualizar dados no localStorage
        const newSignupData = {
          ...signupData,
          verificationCode: newVerificationCode,
          timestamp: Date.now(),
          expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutos
        };

        localStorage.setItem('pendingSignup', JSON.stringify(newSignupData));
        setSignupData(newSignupData);
        setTimeLeft(600); // 10 minutos em segundos

        setResendMessage('New code sent successfully!');
        setTimeout(() => setResendMessage(''), 3000);
      } else {
        throw new Error('Error resending code. Please try again.');
      }

    } catch (error) {
      console.error('Erro ao reenviar código:', error);
      setError(error.message);
    } finally {
      setResendLoading(false);
    }
  };

  // Formatar tempo restante
  const formatTimeLeft = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Função para inserir código automaticamente (útil para testes)
  const handleAutoFillCode = () => {
    if (signupData && signupData.verificationCode) {
      setVerificationCode(signupData.verificationCode);
    }
  };

  return (
    <div className="two-panel-container">
      {/* Painel Esquerdo - Logo */}
      <div className="panel-left">
        <div className="logo-container">
          <img 
            src="/logo/sheet-tools-logo-backgroundremover.png" 
            alt="Sheet Tools" 
            className="logo" 
          />
        </div>
      </div>

      {/* Painel Direito - Conteúdo */}
      <div className="panel-right">
        <div className="panel-content">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="heading-xl">
              Automate Your 
              <span className="highlight"> Facebook Campaigns</span>
            </h1>
            <p className="text-lg mb-2">We sent an 8-digit code to:</p>
            <p className="text-md mb-4" style={{ 
              color: 'var(--accent-primary)', 
              fontWeight: '600'
            }}>
              {signupData ? signupData.email : 'your email'}
            </p>
            {timeLeft > 0 && (
              <p className="text-sm" style={{ color: 'var(--accent-warning)' }}>
                ⏱️ Code expires in: <strong>{formatTimeLeft(timeLeft)}</strong>
              </p>
            )}
          </div>

          <form onSubmit={handleVerifyCode} className="mb-5">
            <div className="form-group">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setVerificationCode(value);
                }}
                placeholder="12345678"
                className="form-input"
                style={{ 
                  textAlign: 'center', 
                  fontSize: '1.5rem',
                  letterSpacing: '0.25rem',
                  fontWeight: '600'
                }}
                maxLength="8"
                required
                disabled={loading || timeLeft <= 0}
              />
              <div className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
                Enter the 8-digit code
              </div>
            </div>

            {/* Mensagens */}
            {error && (
              <div className="message message-error mb-4">
                {error}
              </div>
            )}
            
            {resendMessage && (
              <div className="message message-success mb-4">
                {resendMessage}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-full btn-large" 
              disabled={loading || timeLeft <= 0 || verificationCode.length !== 8}
            >
              {loading ? (
                <>
                  <span style={{ 
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid currentColor',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '0.5rem'
                  }}></span>
                  Verifying...
                </>
              ) : (
                'Verify and Create Account'
              )}
            </button>
          </form>

          {/* Ações de Verificação */}
          <div className="text-center mb-6">
            <button 
              onClick={handleResendCode} 
              className="btn btn-ghost mb-3" 
              disabled={resendLoading || timeLeft > 540}
              style={{ marginRight: '0.5rem' }}
            >
              {resendLoading ? (
                <>
                  <span style={{ 
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid currentColor',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '0.5rem'
                  }}></span>
                  Resending...
                </>
              ) : (
                timeLeft > 540 ? 
                  `Resend in ${formatTimeLeft(timeLeft - 540)}` : 
                  '📧 Resend code'
              )}
            </button>

            <br />

            <button 
              onClick={onBackToSignup} 
              className="link"
            >
              ← Back to signup
            </button>


          </div>

          {/* Informações */}
          <div className="glass-card" style={{ padding: '1rem' }}>
            <p className="text-sm mb-2">📱 Check your inbox and spam folder</p>
            <p className="text-sm">🔒 Your email will be verified and the account will be created automatically</p>
          </div>


        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EmailVerification;

/*
FLUXO DO COMPONENTE:

1. Carrega dados do localStorage (email, código, expiração)
2. Inicia contador regressivo de 10 minutos
3. Usuário insere código de 8 dígitos
4. Verifica se código está correto
5. Se correto, cria conta no Supabase
6. Redireciona para aplicação principal

FUNCIONALIDADES:
- Validação de código (8 dígitos numéricos)
- Contador regressivo de expiração
- Reenvio de código (limitado)
- Auto-preenchimento para desenvolvimento
- Limpeza automática de dados expirados
*/