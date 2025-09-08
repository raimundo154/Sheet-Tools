import React, { useEffect, useState } from 'react';
import authService from '../services/authService';
import { navigation } from '../utils/navigation';
import LoadingScreen from './LoadingScreen';

const AuthCallback = ({ onAuthSuccess, onAuthError }) => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase automatically processes the callback
        // We just need to check if the user was authenticated
        const session = await authService.initialize();
        
        if (session && session.user) {
          setMessage('Login successful! Redirecting...');
          setTimeout(() => {
            onAuthSuccess && onAuthSuccess(session.user);
            // Redirect to dashboard
            navigation.redirectAfterLogin();
          }, 2000);
        } else {
          throw new Error('Authentication failed');
        }
      } catch (error) {
        console.error('Authentication callback error:', error);
        setMessage('Authentication error. Please try again.');
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
