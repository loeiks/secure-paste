import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:7888');

function App() {
  const [text, setText] = useState('');
  const [publishedText, setPublishedText] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    socket.on('new_text', (receivedText) => {
      setPublishedText(receivedText);
      setIsPublished(true);
    });

    return () => {
      socket.off('new_text');
    };
  }, []);

  const handlePublish = () => {
    if (text.trim()) {
      socket.emit('publish_text', text);
      setText('');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publishedText);
      alert('Text copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Secure Paste</h1>
        {!isPublished ? (
          <div className="input-container">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to share..."
            />
            <button onClick={handlePublish}>Publish</button>
          </div>
        ) : (
          <div className="published-container">
            <p className="published-text">{publishedText}</p>
            <button onClick={handleCopy}>Copy</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
