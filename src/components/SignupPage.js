// Componente de cadastro com verificação por email
// Este componente permite ao usuário inserir seu email e solicitar um código de verificação

import React, { useState, useEffect } from 'react';
import emailService from '../services/emailService';
import authService from '../services/authService';
import { navigation } from '../utils/navigation';

const SignupPage = ({ onSignupRequest, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Prefill de email vindo do login
  useEffect(() => {
    const prefill = localStorage.getItem('prefillSignupEmail');
    if (prefill) {
      setEmail(prefill);
      localStorage.removeItem('prefillSignupEmail');
    }
  }, []);

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
        throw new Error('Please enter your email');
      }

      if (!validateEmail(email.trim())) {
        throw new Error('Please enter a valid email');
      }

      // Verificar se o serviço de email está configurado
      if (!emailService.isConfigured()) {
        throw new Error(
          'Email service not configured. Please contact the administrator.'
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

        setSuccess('Code sent successfully! Check your email.');
        
        // Chamar callback para navegar para página de verificação
        if (onSignupRequest) {
          onSignupRequest({
            email: email.trim(),
            verificationCode: verificationCode
          });
        }

      } else {
        throw new Error('Failed to send code. Please try again.');
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

  // Função para criar conta com Google
  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await authService.signInWithGoogle();
      // O usuário será redirecionado automaticamente após o login
    } catch (error) {
      console.error('Erro no signup com Google:', error);
      setError(error.message || 'Erro ao criar conta com Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="two-panel-container">
      {/* Painel Esquerdo - Logo com Animações */}
      <div className="panel-left" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Linhas Animadas de Fundo */}
        <div className="animated-lines">
          <div className="line line-1"></div>
          <div className="line line-2"></div>
          <div className="line line-3"></div>
          <div className="line line-4"></div>
          <div className="line line-5"></div>
          <div className="line line-6"></div>
        </div>
        
        {/* Círculos Flutuantes */}
        <div className="floating-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
          <div className="circle circle-4"></div>
          <div className="circle circle-5"></div>
          <div className="circle circle-6"></div>
          <div className="circle circle-7"></div>
          <div className="circle circle-8"></div>
        </div>
        
        <div className="logo-container" style={{ position: 'relative', zIndex: 10 }}>
          <img 
            src="/logo/sheet-tools-logo-backgroundremover.png" 
            alt="Sheet Tools" 
            className="logo"
            style={{ 
              width: '280px', 
              height: 'auto',
              maxWidth: '80%',
              filter: 'drop-shadow(0 0 20px rgba(150, 242, 215, 0.3))'
            }}
          />
        </div>
      </div>

      {/* Painel Direito - Formulário */}
      <div className="panel-right">
        <div className="panel-content">
          {/* Header */}
          <div className="text-left mb-6">
            <h1 className="heading-xl">Sign Up</h1>
          </div>

          <form onSubmit={handleSendVerificationCode} className="mb-5">
          <p className="text-lg">
              Enter your email:
            </p>
            <div className="form-group">
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '1rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  zIndex: 10,
                  color: 'var(--text-muted)'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <polyline 
                      points="22,6 12,13 2,6" 
                      stroke="currentColor" 
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
                  placeholder="your-email@gmail.com"
                  className="form-input"
                  style={{ paddingLeft: '3rem' }}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Mensagens de erro e sucesso */}
            {error && (
              <div className="message message-error mb-4">
                {error}
                {error.includes('não configurado') && (
                  <div className="message message-info mt-2">
                    <p>💡 Para configurar o envio de emails:</p>
                    <ol style={{ textAlign: 'left', margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                      <li>Crie um arquivo .env na raiz do projeto</li>
                      <li>Adicione suas credenciais de email</li>
                      <li>Reinicie o servidor</li>
                    </ol>
                    <button 
                      type="button" 
                      onClick={handleTestEmailConfig}
                      className="btn btn-ghost mt-2"
                      disabled={loading}
                    >
                      🧪 Testar Configuração
                    </button>
                  </div>
                )}
              </div>
            )}

            {success && (
              <div className="message message-success mb-4">
                {success}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-full btn-large"
              disabled={loading || isLoading}
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
                  Sending code...
                </>
              ) : (
                'Send the code'
              )}
            </button>
          </form>

         

          {/* Separador */}
          <div 
            
            style={{
              backgroundColor: '#e0e0e0', // cinza mais escuro
              height: '0.5px',              // mais grosso
              borderRadius: '15px',
              margin: '10px',
              
            }}
          ></div>
          <p className="text-sm text-center mb-4" style={{ color: 'var(--text-muted)' }}>
            Or continue with
          </p>

          {/* Botão Google */}
          <div className="flex-center mb-6">
            <button 
              className="btn btn-icon"
              onClick={handleGoogleSignup}
              type="button"
              disabled={isLoading}
              style={{
                width: '65px',
                height: '65px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google" 
                style={{ width: '24px', height: '24px' }}
              />
            </button>
          </div>

          {/* Footer */}
          <div className="text-center">
          <p className="text-sm">
              Already have an account?{' '}
              <button 
                type="button" 
                className="link"
                onClick={() => navigation.toLogin()}
              >
                Sign in
              </button>
            </p><br></br>
            <p className="text-sm mb-2">
              By creating an account, you agree to our{' '}
              <button type="button" className="link">Terms and Conditions</button>
            </p>
            
          </div>


        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Animações das Linhas */
        .animated-lines {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }

        .line {
          position: absolute;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(150, 242, 215, 0.5), 
            transparent
          );
          height: 1px;
          width: 200%;
          animation: slideRight 8s linear infinite;
          box-shadow: 0 0 3px rgba(150, 242, 215, 0.3);
        }

        .line-1 {
          top: 15%;
          animation-delay: 0s;
          animation-duration: 12s;
        }

        .line-2 {
          top: 25%;
          animation-delay: -2s;
          animation-duration: 10s;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(94, 236, 255, 0.4), 
            transparent
          );
          box-shadow: 0 0 3px rgba(94, 236, 255, 0.25);
        }

        .line-3 {
          top: 45%;
          animation-delay: -4s;
          animation-duration: 14s;
        }

        .line-4 {
          top: 65%;
          animation-delay: -6s;
          animation-duration: 9s;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(94, 236, 255, 0.35), 
            transparent
          );
          box-shadow: 0 0 3px rgba(94, 236, 255, 0.2);
        }

        .line-5 {
          top: 75%;
          animation-delay: -8s;
          animation-duration: 11s;
        }

        .line-6 {
          top: 85%;
          animation-delay: -10s;
          animation-duration: 13s;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(150, 242, 215, 0.4), 
            transparent
          );
          box-shadow: 0 0 3px rgba(150, 242, 215, 0.25);
        }

        @keyframes slideRight {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        /* Círculos Flutuantes */
        .floating-circles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 2;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(150, 242, 215, 0.2);
          animation: float 6s ease-in-out infinite;
          box-shadow: 0 0 20px rgba(150, 242, 215, 0.3);
        }

        .circle-1 {
          width: 80px;
          height: 80px;
          top: 15%;
          left: 8%;
          animation-delay: 0s;
          background: rgba(150, 242, 215, 0.25);
          box-shadow: 0 0 25px rgba(150, 242, 215, 0.4);
        }

        .circle-2 {
          width: 120px;
          height: 120px;
          top: 55%;
          right: 12%;
          animation-delay: -2s;
          background: rgba(94, 236, 255, 0.2);
          box-shadow: 0 0 30px rgba(94, 236, 255, 0.35);
        }

        .circle-3 {
          width: 60px;
          height: 60px;
          bottom: 18%;
          left: 18%;
          animation-delay: -4s;
          background: rgba(150, 242, 215, 0.3);
          box-shadow: 0 0 20px rgba(150, 242, 215, 0.45);
        }

        .circle-4 {
          width: 40px;
          height: 40px;
          top: 30%;
          right: 8%;
          animation-delay: -1s;
          background: rgba(94, 236, 255, 0.25);
          box-shadow: 0 0 15px rgba(94, 236, 255, 0.4);
          animation-duration: 8s;
        }

        .circle-5 {
          width: 100px;
          height: 100px;
          top: 75%;
          right: 25%;
          animation-delay: -3s;
          background: rgba(150, 242, 215, 0.18);
          box-shadow: 0 0 25px rgba(150, 242, 215, 0.3);
          animation-duration: 7s;
        }

        .circle-6 {
          width: 35px;
          height: 35px;
          top: 40%;
          left: 25%;
          animation-delay: -5s;
          background: rgba(94, 236, 255, 0.3);
          box-shadow: 0 0 18px rgba(94, 236, 255, 0.5);
          animation-duration: 5s;
        }

        .circle-7 {
          width: 70px;
          height: 70px;
          top: 8%;
          right: 30%;
          animation-delay: -6s;
          background: rgba(150, 242, 215, 0.22);
          box-shadow: 0 0 22px rgba(150, 242, 215, 0.35);
          animation-duration: 9s;
        }

        .circle-8 {
          width: 45px;
          height: 45px;
          bottom: 35%;
          left: 5%;
          animation-delay: -7s;
          background: rgba(94, 236, 255, 0.28);
          box-shadow: 0 0 20px rgba(94, 236, 255, 0.45);
          animation-duration: 6s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-25px) scale(1.15);
            opacity: 0.8;
          }
        }

        /* Linhas Verticais Animadas */
        .animated-lines::before {
          content: '';
          position: absolute;
          left: 20%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(180deg, 
            transparent, 
            rgba(150, 242, 215, 0.4), 
            transparent
          );
          animation: verticalPulse 4s ease-in-out infinite;
        }

        .animated-lines::after {
          content: '';
          position: absolute;
          right: 25%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(180deg, 
            transparent, 
            rgba(150, 242, 215, 0.3), 
            transparent
          );
          animation: verticalPulse 4s ease-in-out infinite;
          animation-delay: -2s;
        }

        @keyframes verticalPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scaleY(0.8);
          }
          50% {
            opacity: 0.8;
            transform: scaleY(1.2);
          }
        }
      `}</style>
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