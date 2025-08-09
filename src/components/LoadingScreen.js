import React from 'react';

const LoadingScreen = ({ message = 'Carregando...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Container da animação do favicon */}
      <div style={{
        position: 'relative',
        width: '300px',
        height: '80px',
        marginBottom: '2rem'
      }}>
        {/* Favicon animado */}
        <div style={{
          position: 'absolute',
          left: '0',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '60px',
          height: '60px',
          backgroundImage: 'url(/logo/favicon.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          animation: 'slideFromLeft 2.5s ease-in-out infinite',
          filter: 'drop-shadow(0 2px 8px rgba(150, 242, 215, 0.3))'
        }} />
        
        {/* Trilha/linha de fundo */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          right: '0',
          height: '2px',
          backgroundColor: '#f0f0f0',
          borderRadius: '1px',
          transform: 'translateY(-50%)'
        }} />
        
        {/* Linha de progresso */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          height: '2px',
          backgroundColor: '#96f2d7',
          borderRadius: '1px',
          transform: 'translateY(-50%)',
          animation: 'progressLine 2s ease-in-out infinite',
          boxShadow: '0 0 8px rgba(150, 242, 215, 0.5)'
        }} />
      </div>

      {/* Mensagem */}
      <p style={{
        fontSize: '1.1rem',
        color: '#666666',
        textAlign: 'center',
        margin: 0,
        fontWeight: '500'
      }}>
        {message}
      </p>

      {/* CSS das animações */}
      <style>{`
        @keyframes slideFromLeft {
          0% {
            left: 0;
            opacity: 0.8;
            transform: translateY(-50%) scale(0.9);
          }
          50% {
            left: 50%;
            transform: translateY(-50%) translateX(-50%) scale(1.1);
            opacity: 1;
          }
          100% {
            left: calc(100% - 60px);
            opacity: 0.8;
            transform: translateY(-50%) scale(0.9);
          }
        }

        @keyframes progressLine {
          0% {
            width: 0;
            opacity: 0.4;
          }
          50% {
            width: 60%;
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
