import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showCustomRoom, setShowCustomRoom] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [username, setUsername] = useState('');
  const [customRoomCode, setCustomRoomCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const roomCategories = {
    'General & Social': [
      { name: '💬 General Chat', code: '-1001' },
      { name: '🌍 World Chat', code: '-1002' },
      { name: '😎 Chill Chat', code: '-1003' },
      { name: '🎉 Fun Zone', code: '-1004' }
    ],
    'Relationships & People': [
      { name: '💕 Singles Chat', code: '-2001' },
      { name: '👑 Teen Chat', code: '-2002' },
      { name: '🎓 College Chat', code: '-2003' }
    ],
    'Interests & Hobbies': [
      { name: '🎵 Music Chat', code: '-3001' },
      { name: '📚 Study Chat', code: '-3002' },
      { name: '🎥 Movies & TV', code: '-3003' }
    ]
  };

  const allRooms = Object.values(roomCategories).flat();

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setShowUsernameModal(true);
    setError('');
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/check_username', {
        username,
        security_code: selectedRoom.code,
      });
      if (response.data.success) {
        // Store in sessionStorage for navigation persistence
        sessionStorage.setItem('chatCredentials', JSON.stringify({
          username,
          securityCode: selectedRoom.code,
          roomName: selectedRoom.name
        }));
        navigate('/chat', { state: { username, securityCode: selectedRoom.code } });
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  const handleCustomRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/check_username', {
        username,
        security_code: customRoomCode,
      });
      if (response.data.success) {
        // Store in sessionStorage for navigation persistence
        sessionStorage.setItem('chatCredentials', JSON.stringify({
          username,
          securityCode: customRoomCode,
          roomName: 'Custom Room'
        }));
        navigate('/chat', { state: { username, securityCode: customRoomCode } });
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  if (showCustomRoom) {
    return (
      <div className="welcome-container">
        <h1>Custom Room</h1>
        <form onSubmit={handleCustomRoomSubmit}>
          <div className="form-row">
            <label>Enter your name:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="security-code-input"
              required
            />
          </div>
          <div className="form-row">
            <label>Enter room code:</label>
            <input
              type="text"
              value={customRoomCode}
              onChange={(e) => setCustomRoomCode(e.target.value)}
              className="security-code-input"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="enter-button">Join Room</button>
          <button type="button" className="back-button" onClick={() => setShowCustomRoom(false)}>Back</button>
        </form>
      </div>
    );
  }

  if (showUsernameModal) {
    return (
      <div className="welcome-container">
        <h1>{selectedRoom.name}</h1>
        <form onSubmit={handleUsernameSubmit}>
          <div className="form-row">
            <label>Enter your name:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="security-code-input"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="enter-button">Join Room</button>
          <button type="button" className="back-button" onClick={() => setShowUsernameModal(false)}>Back</button>
        </form>
      </div>
    );
  }

  return (
    <div className="welcome-container">
      <h1>Choose Your Room</h1>
      <div className="rooms-main-grid">
        {allRooms.map((room) => (
          <button
            key={room.code}
            className="room-main-card"
            onClick={() => handleRoomSelect(room)}
          >
            <div className="room-main-icon">{room.name.split(' ')[0]}</div>
            <div className="room-main-name">{room.name.substring(room.name.indexOf(' ') + 1)}</div>
          </button>
        ))}
      </div>
      <div className="custom-room-container">
        <button className="custom-room-button" onClick={() => setShowCustomRoom(true)}>
          🔧 Custom Room
        </button>
      </div>
    </div>
  );
}

export default Login;