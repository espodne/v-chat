import React from "react";

const Controls: React.FC<{
  toggleVideo: () => void;
  toggleAudio: () => void;
  isVideoOn: boolean;
  isMuted: boolean;
}> = ({ toggleVideo, toggleAudio, isVideoOn, isMuted }) => {
  return (
    <div className="controls">
      <button onClick={toggleVideo}>
        {isVideoOn ? "Turn Off Video" : "Turn On Video"}
      </button>
      <button onClick={toggleAudio}>{isMuted ? "Unmute" : "Mute"}</button>
    </div>
  );
};

export default Controls;
