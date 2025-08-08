import React, { useState } from 'react';
import authService from '../services/authService';
import './EmailVerification.css';

const EmailVerification = ({ email, onVerificationSuccess, onBackToLogin }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!verificationCode.trim()) {
        throw new Error('Por favor, insira o código de verificação');
      }

      const result = await authService.verifyOtp(email, verificationCode.trim());
      
      if (result.user) {
        onVerificationSuccess && onVerificationSuccess(result.user);
      }
    } catch (error) {
      console.error('Erro na verificação:', error);
      setError(error.message || 'Código de verificação inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setResendMessage('');
    setError('');

    try {
      await authService.signInWithMagicLink(email);
      setResendMessage('Novo código enviado com sucesso!');
      setTimeout(() => setResendMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao reenviar código:', error);
      setError('Erro ao reenviar código. Tente novamente.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="email-verification-container">
      <div className="email-verification-content">
        <div className="verification-header">
          <h1 className="verification-title">Verifique seu Email</h1>
          <p className="verification-subtitle">
            Enviamos um código de verificação para
          </p>
          <p className="verification-email">{email}</p>
        </div>

        <form onSubmit={handleVerifyCode} className="verification-form">
          <div className="code-input-container">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Digite o código de 6 dígitos"
              className="code-input"
              maxLength="6"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {resendMessage && (
            <div className="success-message">
              {resendMessage}
            </div>
          )}

          <button 
            type="submit" 
            className="verify-button"
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Verificar Código'}
          </button>
        </form>

        <div className="verification-actions">
          <button 
            onClick={handleResendCode}
            className="resend-button"
            disabled={resendLoading}
          >
            {resendLoading ? 'Reenviando...' : 'Reenviar código'}
          </button>

          <button 
            onClick={onBackToLogin}
            className="back-button"
          >
            Voltar ao login
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
