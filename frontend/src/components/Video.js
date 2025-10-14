import React from 'react';
import { useNavigate } from 'react-router-dom';

function Video() {
  const navigate = useNavigate();

  return (
    <div className="video-container">
      <div className="video-content">
        <div className="video-header">
          <h1 className="video-title">🎥 Video Conferencing</h1>
          <p className="video-subtitle">High-quality video calls coming soon</p>
        </div>
        
        <div className="video-features">
          <div className="feature-card">
            <div className="feature-icon">📹</div>
            <h3>HD Video Calls</h3>
            <p>Crystal clear video quality with adaptive streaming</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎤</div>
            <h3>Audio Chat</h3>
            <p>High-fidelity audio with noise cancellation</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Cross Platform</h3>
            <p>Works seamlessly across all devices</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>End-to-end encrypted video communications</p>
          </div>
        </div>
        
        <div className="video-status">
          <div className="status-badge">
            <span className="status-dot"></span>
            Coming Soon
          </div>
          <p className="status-text">
            We're working hard to bring you the best video conferencing experience. 
            Stay tuned for updates!
          </p>
        </div>
        
        <div className="video-actions">
          <button 
            className="action-button primary"
            onClick={() => navigate('/login')}
          >
            Try Text Chat
          </button>
          <button 
            className="action-button secondary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Video;