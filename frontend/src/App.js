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
  const [showInput, setShowInput] = useState(false);
  const [showPublished, setShowPublished] = useState(false);

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
      setShowPublished(false); // Hide text by default when receiving new content
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
      setShowInput(false);
    }
  };

  const handleCopy = async () => {
    try {
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = publishedText;
      
      tempTextArea.style.position = 'fixed';
      tempTextArea.style.left = '0';
      tempTextArea.style.top = '0';
      tempTextArea.style.opacity = '0';
      
      document.body.appendChild(tempTextArea);
      
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
      
      document.execCommand('copy');
      document.body.removeChild(tempTextArea);
      
      showNotification('Text copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showNotification('Press and hold to copy the text manually', 'info');
      alert(publishedText);
    }
  };

  const handleReset = () => {
    setIsPublished(false);
    setPublishedText('');
    setShowPublished(false);
  };

  const censorText = (text) => {
    return '•'.repeat(text.length);
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
            <div className="textarea-container">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to share..."
                type={showInput ? "text" : "password"}
              />
              <button 
                className="toggle-button"
                onClick={() => setShowInput(!showInput)}
                title={showInput ? "Hide text" : "Show text"}
              >
                {showInput ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            <div className="text-preview">
              {text && (showInput ? text : censorText(text))}
            </div>
            <button 
              onClick={handlePublish}
              disabled={connectionStatus !== 'connected'}
            >
              Publish
            </button>
          </div>
        ) : (
          <div className="published-container">
            <div className="published-text-container">
              <div className="published-text">
                {showPublished ? publishedText : censorText(publishedText)}
              </div>
              <button 
                className="toggle-button"
                onClick={() => setShowPublished(!showPublished)}
                title={showPublished ? "Hide text" : "Show text"}
              >
                {showPublished ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
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
