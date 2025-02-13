import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [text, setText] = useState('');
  const [publishedText, setPublishedText] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [notification, setNotification] = useState(null);
  const textAreaRef = useRef(null);

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
      // Create a temporary textarea element
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = publishedText;
      
      // Make it invisible but keep it in the viewport
      tempTextArea.style.position = 'fixed';
      tempTextArea.style.left = '0';
      tempTextArea.style.top = '0';
      tempTextArea.style.opacity = '0';
      
      document.body.appendChild(tempTextArea);
      
      // Handle iOS devices
      if (navigator.userAgent.match(/ipad|iphone/i)) {
        const range = document.createRange();
        range.selectNodeContents(tempTextArea);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        tempTextArea.setSelectionRange(0, 999999);
      } else {
        tempTextArea.select();
      }
      
      // Execute copy command
      document.execCommand('copy');
      
      // Cleanup
      document.body.removeChild(tempTextArea);
      
      showNotification('Text copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      
      // Fallback: Show the text in a modal or alert
      showNotification('Press and hold to copy the text manually', 'info');
      alert(publishedText);
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
            <div 
              className="published-text"
              ref={textAreaRef}
            >
              {publishedText}
            </div>
            <div className="button-group">
              <button onClick={handleCopy}>Copy</button>
              <button onClick={handleReset}>Reset</button>
            </div>
            {/* Invisible but selectable text for mobile devices */}
            <textarea
              readOnly
              value={publishedText}
              className="mobile-copy-textarea"
              onClick={(e) => e.target.select()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
