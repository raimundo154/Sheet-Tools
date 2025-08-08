// Componente de verificação de código enviado por email
// Este componente permite ao usuário inserir o código de 8 dígitos recebido por email

import React, { useState, useEffect } from 'react';
import emailService from '../services/emailService';
import authService from '../services/authService';
import './LoginPage.css';
import './EmailVerification.css';

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
        setError('Código expirado. Solicite um novo código.');
      }
    } else {
      setError('Nenhum código pendente. Solicite um novo código.');
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
      setError('Código expirado. Solicite um novo código.');
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
        throw new Error('Por favor, insira o código de verificação');
      }

      if (verificationCode.trim().length !== 8) {
        throw new Error('O código deve ter 8 dígitos');
      }

      if (!signupData) {
        throw new Error('Dados de verificação não encontrados. Solicite um novo código.');
      }

      // Verificar se o código não expirou
      if (Date.now() > signupData.expiresAt) {
        localStorage.removeItem('pendingSignup');
        throw new Error('Código expirado. Solicite um novo código.');
      }

      // Verificar se o código está correto
      if (verificationCode.trim() !== signupData.verificationCode) {
        throw new Error('Código incorreto. Verifique e tente novamente.');
      }

      // Código correto! Criar conta no Supabase
      const result = await authService.createAccountWithEmail(signupData.email);
      
      if (result.user) {
        // Limpar dados temporários
        localStorage.removeItem('pendingSignup');
        
        // Chamar callback de sucesso
        onVerificationSuccess && onVerificationSuccess(result.user);
      } else {
        throw new Error('Erro ao criar conta. Tente novamente.');
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
        throw new Error('Email não encontrado. Volte e insira seu email novamente.');
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

        setResendMessage('Novo código enviado com sucesso!');
        setTimeout(() => setResendMessage(''), 3000);
      } else {
        throw new Error('Erro ao reenviar código. Tente novamente.');
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
    <div className="login-container">
      {/* Painel Esquerdo - Logo */}
      <div className="login-left-panel">
        <div className="logo-container">
          <img src="/logo/sheet-tools-logo-backgroundremover.png" alt="Sheet Tools" className="login-logo" />
        </div>
      </div>

      {/* Painel Direito - Conteúdo */}
      <div className="login-right-panel">
        <div className="login-form-container">
          <div className="verification-header">
            <h1 className="verification-title">VERIFY EMAIL</h1>
            <p className="verification-subtitle">Enviámos um código de 8 dígitos para:</p>
            <p className="verification-email">{signupData ? signupData.email : 'seu email'}</p>
            {timeLeft > 0 && (
              <p className="verification-timer">⏱️ Código expira em: <strong>{formatTimeLeft(timeLeft)}</strong></p>
            )}
          </div>

          <form onSubmit={handleVerifyCode} className="verification-form">
            <div className="code-input-container">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setVerificationCode(value);
                }}
                placeholder="12345678"
                className="code-input"
                maxLength="8"
                required
                disabled={loading || timeLeft <= 0}
              />
              <div className="code-format-hint">Insira o código de 8 dígitos</div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {resendMessage && <div className="success-message">{resendMessage}</div>}

            <button type="submit" className="verify-button" disabled={loading || timeLeft <= 0 || verificationCode.length !== 8}>
              {loading ? (<><span className="loading-spinner"></span>Verificando...</>) : 'Verificar e Criar Conta'}
            </button>
          </form>

          <div className="verification-actions">
            <button onClick={handleResendCode} className="resend-button" disabled={resendLoading || timeLeft > 540}>
              {resendLoading ? (<><span className="loading-spinner"></span>Reenviando...</>) : (timeLeft > 540 ? `Reenviar em ${formatTimeLeft(timeLeft - 540)}` : '📧 Reenviar código')}
            </button>

            <button onClick={onBackToSignup} className="back-button">← Voltar ao cadastro</button>

            {process.env.NODE_ENV === 'development' && signupData && (
              <button onClick={handleAutoFillCode} className="dev-autofill-button" type="button">🔧 Auto-preencher (DEV)</button>
            )}
          </div>

          <div className="verification-info">
            <p className="info-text">📱 Verifique sua caixa de entrada e pasta de spam</p>
            <p className="info-text">🔒 Seu email será verificado e a conta será criada automaticamente</p>
          </div>

          {process.env.NODE_ENV === 'development' && signupData && (
            <div className="dev-info">
              <h4>🔧 Informações de Desenvolvimento</h4>
              <p><strong>Email:</strong> {signupData.email}</p>
              <p><strong>Código:</strong> {signupData.verificationCode}</p>
              <p><strong>Expira em:</strong> {new Date(signupData.expiresAt).toLocaleTimeString()}</p>
              <p><strong>Tempo restante:</strong> {formatTimeLeft(timeLeft)}</p>
            </div>
          )}
        </div>
      </div>
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
