import React, { useState } from 'react';

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');

  const sendMessage = () => {
    console.log(message);
    setMessage('');
  };

  return (
    <div className="chat">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message here..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;