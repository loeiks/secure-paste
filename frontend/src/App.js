import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [receivedText, setReceivedText] = useState('');
  const [showInput, setShowInput] = useState(true);
  const ws = useRef(null);

  useEffect(() => {
    // Use environment variable or default to localhost:3001
    const websocketURL = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:7878';
    ws.current = new WebSocket(websocketURL);

    ws.current.onopen = () => console.log('WebSocket connected');

    ws.current.onmessage = event => {
      setReceivedText(event.data);
      setShowInput(false);
    };

    ws.current.onclose = () => console.log('WebSocket disconnected');

    ws.current.onerror = error => console.error('WebSocket error:', error);

    return () => {
      ws.current.close();
    };
  }, []);

  const publishText = () => {
    if (text && ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(text);
      setText('');
      setShowInput(false); // Hide input after publishing
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(receivedText);
    alert('Text copied to clipboard!');
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div className="App">
      <h1>Secure Paste</h1>
      {showInput ? (
        <div>
          <textarea
            value={text}
            onChange={handleInputChange}
            placeholder="Enter text to share"
          />
          <button onClick={publishText}>Publish</button>
        </div>
      ) : (
        <div>
          <p>Received Text: {receivedText}</p>
          <button onClick={copyToClipboard}>Copy</button>
        </div>
      )}
    </div>
  );
}

export default App;
