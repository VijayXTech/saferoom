import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

function Chat() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Try to get credentials from state or sessionStorage
  const getCredentials = () => {
    if (state?.username && state?.securityCode) {
      return { username: state.username, securityCode: state.securityCode };
    }
    
    const stored = sessionStorage.getItem('chatCredentials');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { username: parsed.username, securityCode: parsed.securityCode };
      } catch (e) {
        sessionStorage.removeItem('chatCredentials');
      }
    }
    
    return { username: null, securityCode: null };
  };
  
  const { username, securityCode } = getCredentials();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [statusMessages, setStatusMessages] = useState([]);
  const [modalImage, setModalImage] = useState(null);
  const [modalCaption, setModalCaption] = useState('');
  const [toasts, setToasts] = useState([]);
  const socketRef = useRef(null);
  const chatBoxRef = useRef(null);

  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2000);
  };

  useEffect(() => {
    if (!username || !securityCode) {
      navigate('/', { replace: true });
      return;
    }

    socketRef.current = io({
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 30000,
      maxHttpBufferSize: 10 * 1024 * 1024, // Set to 10 MB
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_room', { username, security_code: securityCode });
    });

    socketRef.current.on('join_ack', (data) => {
      setStatusMessages((prev) => [
        ...prev.filter((msg) => msg.username !== data.username),
        { username: data.username, status: data.status, timestamp: new Date() },
      ]);
      addToast(`${data.username} joined the room`);
    });

    socketRef.current.on('user_joined', (data) => {
      addToast(`${data.username} joined the room`);
    });

    socketRef.current.on('username_error', (data) => {
      if (data.block) {
        alert(data.message);
        sessionStorage.removeItem('chatCredentials');
        navigate('/', { replace: true });
      }
    });

    socketRef.current.on('message', (data) => {
      setMessages((prev) => [...prev, data]);
      setTimeout(scrollToBottom, 100);
    });

    socketRef.current.on('image', (data) => {
      setMessages((prev) => [...prev, { ...data, type: 'image' }]);
      setTimeout(scrollToBottom, 100);
    });

    socketRef.current.on('user_status', (data) => {
      setStatusMessages((prev) => [
        ...prev.filter((msg) => msg.username !== data.username),
        { username: data.username, status: data.status, timestamp: new Date() },
      ]);
      addToast(`${data.username} is ${data.status}`);
      scrollToBottom();
    });

    socketRef.current.on('disconnect', (reason) => {
      addToast('Disconnected from server. Please try again later.');
      console.log('Disconnected:', reason);
    });

    socketRef.current.on('connect_error', (error) => {
      addToast('Connection error. Please check your network.');
      console.log('Connection Error:', error);
    });

    const handleFocus = () => socketRef.current.emit('user_status', { username, status: 'online', security_code: securityCode });
    const handleBlur = () => socketRef.current.emit('user_status', { username, status: 'offline', security_code: securityCode });

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    const interval = setInterval(() => {
      if (document.hasFocus()) handleFocus();
    }, 30000);

    let isKeyboardActive = false;
    const messageInput = document.getElementById('message-input');
    const chatBox = document.getElementById('chat-box');

    if (messageInput) {
      messageInput.addEventListener('focus', () => {
        if (window.innerWidth <= 600) {
          isKeyboardActive = true;
        }
      });

      messageInput.addEventListener('blur', () => {
        isKeyboardActive = false;
      });
    }

    if (chatBox) {
      chatBox.addEventListener(
        'touchmove',
        (event) => {
          if (window.innerWidth <= 600) {
            event.stopPropagation();
            if (isKeyboardActive) {
              const atTop = chatBox.scrollTop <= 0;
              const atBottom = chatBox.scrollTop >= chatBox.scrollHeight - chatBox.clientHeight;
              if ((atTop && event.deltaY < 0) || (atBottom && event.deltaY < 0)) {
                event.preventDefault();
              }
            } else {
              const atTop = chatBox.scrollTop <= 0;
              const atBottom = chatBox.scrollTop >= chatBox.scrollHeight - chatBox.clientHeight;
              if ((atTop && event.deltaY < 0) || (atBottom && event.deltaY > 0)) {
                event.preventDefault();
              }
            }
          }
        },
        { passive: false }
      );
    }

    return () => {
      socketRef.current.disconnect();
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      clearInterval(interval);
      // Clear credentials on component unmount
      sessionStorage.removeItem('chatCredentials');
    };
  }, [username, securityCode, navigate]);

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  // Auto-scroll when messages change
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socketRef.current.emit('message', {
        username,
        message,
        timestamp: new Date().toISOString(),
        security_code: securityCode,
      });
      setMessage('');
      setTimeout(scrollToBottom, 50);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10 MB limit)
      const maxSize = 10 * 1024 * 1024; // 10 MB in bytes
      if (file.size > maxSize) {
        addToast('Image is too large. Maximum size allowed is 10 MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const arrayBuffer = event.target.result;
        const imageData = new Uint8Array(arrayBuffer);
        socketRef.current.emit('image', {
          username,
          image_data: imageData,
          filename: file.name,
          mime_type: file.type,
          security_code: securityCode,
        });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const openModal = (imageData, filename, mimeType) => {
    const blob = new Blob([imageData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    setModalImage(url);
    setModalCaption(filename);

    const modal = document.getElementById('image-modal');
    const closeModalElement = document.getElementById('close-modal');
    if (modal && closeModalElement) {
      closeModalElement.onclick = () => {
        setModalImage(null);
        setModalCaption('');
        URL.revokeObjectURL(url);
      };
      window.onclick = (event) => {
        if (event.target === modal) {
          setModalImage(null);
          setModalCaption('');
          URL.revokeObjectURL(url);
        }
      };
      document.onkeydown = (event) => {
        if (event.key === 'Escape') {
          setModalImage(null);
          setModalCaption('');
          URL.revokeObjectURL(url);
        }
      };
    }
  };

  const closeModal = () => {
    setModalImage(null);
    setModalCaption('');
    if (modalImage) URL.revokeObjectURL(modalImage);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      console.error('Invalid timestamp:', timestamp);
      return 'Invalid Time';
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  return (
    <div className="chat-container">
      <header>
        <div className="header-content">
          <h1>SAFE ROOM</h1>
          <div className="header-right">
            <p id="username-display">{username}</p>
            <button 
              className="logout-button"
              onClick={() => {
                sessionStorage.removeItem('chatCredentials');
                navigate('/', { replace: true });
              }}
              title="Leave Chat"
            >
              ✖
            </button>
          </div>
        </div>
      </header>
      <div className="chat-box" id="chat-box" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div key={`msg-${index}`} className="message-container">
            <div className="message">
              {msg.type === 'image' ? (
                <div className="text">
                  <button
                    className="view-button"
                    onClick={() => openModal(msg.image_data, msg.filename, msg.mime_type)}
                  >
                    View Image
                  </button>
                </div>
              ) : (
                <div className="text">{msg.message}</div>
              )}
            </div>
            <div className="username">{msg.username} • {formatTimestamp(msg.timestamp)}</div>
            <div className="timestamp">{formatTimestamp(msg.timestamp)}</div>
          </div>
        ))}
      </div>
      <div className="message-box">
        <input
          type="text"
          id="message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage(e)}
          className="message-input"
          placeholder="Type a message..."
        />
        <label htmlFor="image-input" className="image-label">
          Choose File
        </label>
        <input
          type="file"
          id="image-input"
          accept="image/*"
          onChange={handleImageUpload}
          className="image-input"
        />
        <button id="send-button" onClick={sendMessage}>
          Send
        </button>
      </div>
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            {toast.message}
          </div>
        ))}
      </div>
      {modalImage && (
        <div className="image-modal" id="image-modal" style={{ display: 'block' }}>
          <span className="close-modal" id="close-modal" onClick={closeModal}>
            ×
          </span>
          <img src={modalImage} alt={modalCaption} className="modal-content" id="modal-image" />
          <div id="caption">{modalCaption}</div>
        </div>
      )}
    </div>
  );
}

export default Chat;