import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [text, setText] = useState('');
  const [publishedText, setPublishedText] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const newSocket = io('/', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      setConnectionStatus('connected');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionStatus('error');
    });

    newSocket.on('new_text', (receivedText) => {
      console.log('Received new text');
      setPublishedText(receivedText);
      setIsPublished(true);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handlePublish = () => {
    if (text.trim() && socket) {
      console.log('Publishing text');
      socket.emit('publish_text', text);
      setText('');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publishedText);
      showNotification('Text copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showNotification('Failed to copy text to clipboard', 'error');
    }
  };

  const handleReset = () => {
    setIsPublished(false);
    setPublishedText('');
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Secure Paste</h1>
        
        {/* Notification */}
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="status-indicator">
          Status: {connectionStatus}
        </div>
        
        {!isPublished ? (
          <div className="input-container">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to share..."
            />
            <button 
              onClick={handlePublish}
              disabled={connectionStatus !== 'connected'}
            >
              Publish
            </button>
          </div>
        ) : (
          <div className="published-container">
            <p className="published-text">{publishedText}</p>
            <div className="button-group">
              <button onClick={handleCopy}>Copy</button>
              <button onClick={handleReset}>Reset</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
