import React from 'react';
import ProfilePhoto from './ProfilePhoto';
import './PageHeader.css';

const PageHeader = ({ 
  title, 
  subtitle = null, 
  showProfile = true,
  className = ''
}) => {
  return (
    <div className={`page-header ${className}`}>
      <div className="header-content">
        <div className="header-info">
          <h1 className="page-title">
            <span className="title-highlight">{title}</span>
          </h1>
          {subtitle && (
            <p className="page-subtitle">
              {subtitle}
            </p>
          )}
        </div>
        
        {showProfile && (
          <div className="header-profile">
            <ProfilePhoto 
              size="medium" 
              showUploadOptions={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;