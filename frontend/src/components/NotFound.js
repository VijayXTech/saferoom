import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="video-container">
      <div className="video-content">
        <div className="video-header">
          <h1 className="video-title">🔍 Page Not Found</h1>
          <p className="video-subtitle">The page you're looking for doesn't exist</p>
        </div>
        
        <div className="video-status">
          <div className="status-badge">
            <span className="status-dot"></span>
            404 Error
          </div>
          <p className="status-text">
            Don't worry! Let's get you back to the right place.
          </p>
        </div>
        
        <div className="video-actions">
          <button 
            className="action-button primary"
            onClick={() => navigate('/', { replace: true })}
          >
            Go Home
          </button>
          <button 
            className="action-button secondary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;