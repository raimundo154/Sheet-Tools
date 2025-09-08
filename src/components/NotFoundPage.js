import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { navigation } from '../utils/navigation';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const handleGoHome = () => {
    navigation.toDashboard();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <motion.div 
          className="not-found-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Error Icon */}
          <motion.div 
            className="error-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <AlertTriangle size={80} />
          </motion.div>

          {/* Error Code */}
          <motion.h1 
            className="error-code"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            404
          </motion.h1>

          {/* Error Message */}
          <motion.h2 
            className="error-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Page Not Found
          </motion.h2>

          <motion.p 
            className="error-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            The page you're looking for doesn't exist or has been moved.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            className="error-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <button 
              className="btn btn-primary"
              onClick={handleGoHome}
            >
              <Home size={16} />
              Go to Dashboard
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={handleGoBack}
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          </motion.div>

          {/* Additional Help */}
          <motion.div 
            className="error-help"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <p>Need help? Try one of these:</p>
            <ul>
              <li>Check if the URL is correct</li>
              <li>Use the navigation menu to find what you're looking for</li>
              <li>Visit the dashboard to access all features</li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Background Animation */}
        <div className="not-found-background">
          <motion.div 
            className="floating-shape shape-1"
            animate={{ 
              y: [-20, 20, -20],
              rotate: [0, 180, 360] 
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          <motion.div 
            className="floating-shape shape-2"
            animate={{ 
              y: [20, -20, 20],
              rotate: [360, 180, 0] 
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          <motion.div 
            className="floating-shape shape-3"
            animate={{ 
              y: [-10, 30, -10],
              rotate: [0, -180, -360] 
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;