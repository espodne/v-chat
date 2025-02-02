import React from 'react';
import VideoChat from '../src/components/VideoChat';

const App: React.FC = () => {
  const roomId = window.location.pathname.split('/')[1] || 'default-room';

  return (
    <div className="app">
      <h1>Video Chat</h1>
      <VideoChat roomId={roomId} />
    </div>
  );
};

export default App;