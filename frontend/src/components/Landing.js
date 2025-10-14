import React from 'react';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">SAFEROOM</h1>
        <p className="landing-subtitle">Secure Real-Time Communication Platform</p>
        
        <div className="options-container">
          <button 
            className="option-button text-option"
            onClick={() => navigate('/login')}
          >
            <div className="option-icon">📝</div>
            <div className="option-text">
              <h3>Text</h3>
              <p>Secure text messaging</p>
            </div>
          </button>
          
          <button 
            className="option-button video-option"
            onClick={() => navigate('/video')}
          >
            <div className="option-icon">📹</div>
            <div className="option-text">
              <h3>Video</h3>
              <p>Video conferencing</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;