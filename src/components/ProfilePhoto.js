import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, User, X, Check } from 'lucide-react';
import authService from '../services/authService';
import './ProfilePhoto.css';

const ProfilePhoto = ({ 
  size = 'medium', 
  showUploadOptions = false, 
  onPhotoChange = null,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  // Obter user atual
  const user = authService.user;
  const userEmail = user?.email || 'user@example.com';
  const userInitial = userEmail.charAt(0).toUpperCase();
  const userId = user?.id || 'default-user';

  // Tamanhos do componente
  const sizes = {
    small: { width: 40, height: 40, fontSize: '1rem' },
    medium: { width: 80, height: 80, fontSize: '1.5rem' },
    large: { width: 120, height: 120, fontSize: '2rem' },
    xl: { width: 160, height: 160, fontSize: '2.5rem' }
  };
  
  const currentSize = sizes[size] || sizes.medium;

  // Carregar foto existente (simulado - será implementado com backend)
  React.useEffect(() => {
    loadExistingPhoto();
  }, [userId]);

  const loadExistingPhoto = async () => {
    try {
      // Por enquanto, verificar se existe uma foto salva no localStorage
      const savedPhoto = localStorage.getItem(`profilePhoto_${userId}`);
      if (savedPhoto) {
        setProfilePhoto(savedPhoto);
      }
    } catch (error) {
      console.error('Erro ao carregar foto:', error);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida.');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter menos de 5MB.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Converter para base64 para preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target.result;
        
        // Redimensionar imagem se necessário
        const resizedImage = await resizeImage(imageData, 300, 300);
        
        // Salvar temporariamente no localStorage (será substituído por upload real)
        localStorage.setItem(`profilePhoto_${userId}`, resizedImage);
        setProfilePhoto(resizedImage);
        
        // Callback para componente pai
        if (onPhotoChange) {
          onPhotoChange(resizedImage, file);
        }
        
        setShowUploadMenu(false);
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      setError('Erro ao processar imagem.');
      setIsUploading(false);
    }
  };

  const resizeImage = (imageData, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular dimensões mantendo aspecto
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.src = imageData;
    });
  };

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
      setShowUploadMenu(false);
    } catch (error) {
      setError('Não foi possível acessar a câmera.');
      console.error('Erro ao acessar câmera:', error);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Salvar foto
      localStorage.setItem(`profilePhoto_${userId}`, imageData);
      setProfilePhoto(imageData);
      
      if (onPhotoChange) {
        onPhotoChange(imageData, null);
      }
      
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const removePhoto = () => {
    localStorage.removeItem(`profilePhoto_${userId}`);
    setProfilePhoto(null);
    if (onPhotoChange) {
      onPhotoChange(null, null);
    }
    setShowUploadMenu(false);
  };

  const renderProfileImage = () => {
    if (profilePhoto) {
      return (
        <img 
          src={profilePhoto} 
          alt="Foto de perfil" 
          className="profile-image"
          style={{ 
            width: currentSize.width, 
            height: currentSize.height 
          }}
        />
      );
    }
    
    return (
      <div 
        className="profile-initial"
        style={{ 
          width: currentSize.width, 
          height: currentSize.height,
          fontSize: currentSize.fontSize
        }}
      >
        <User size={currentSize.width * 0.4} />
      </div>
    );
  };

  return (
    <div className={`profile-photo-container ${className}`}>
      <div 
        className={`profile-photo ${showUploadOptions ? 'clickable' : ''}`}
        onClick={showUploadOptions ? () => setShowUploadMenu(true) : undefined}
      >
        {renderProfileImage()}
        
        {showUploadOptions && !isUploading && (
          <div className="photo-overlay">
            <Camera size={20} />
          </div>
        )}
        
        {isUploading && (
          <div className="photo-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>

      {/* Menu de upload */}
      {showUploadMenu && (
        <div className="upload-menu">
          <div className="upload-menu-backdrop" onClick={() => setShowUploadMenu(false)} />
          <div className="upload-menu-content">
            <button 
              className="upload-option"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={20} />
              <span>Carregar foto</span>
            </button>
            
            <button 
              className="upload-option"
              onClick={startCamera}
            >
              <Camera size={20} />
              <span>Tirar foto</span>
            </button>
            
            {profilePhoto && (
              <button 
                className="upload-option remove"
                onClick={removePhoto}
              >
                <X size={20} />
                <span>Remover foto</span>
              </button>
            )}
            
            <button 
              className="upload-option cancel"
              onClick={() => setShowUploadMenu(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal da câmera */}
      {showCamera && (
        <div className="camera-modal">
          <div className="camera-content">
            <div className="camera-header">
              <h3>Tirar foto</h3>
              <button className="close-button" onClick={stopCamera}>
                <X size={24} />
              </button>
            </div>
            
            <div className="camera-preview">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline
                className="camera-video"
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            
            <div className="camera-controls">
              <button className="capture-button" onClick={capturePhoto}>
                <Camera size={24} />
                Capturar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input file escondido */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Mensagens de erro */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default ProfilePhoto;