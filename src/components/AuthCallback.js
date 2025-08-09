import React, { useEffect, useState } from 'react';
import authService from '../services/authService';
import { navigation } from '../utils/navigation';
import LoadingScreen from './LoadingScreen';

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
            // Redirecionar para o dashboard
            navigation.redirectAfterLogin();
          }, 2000);
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
    <LoadingScreen message={message} />
  );
};

export default AuthCallback;
