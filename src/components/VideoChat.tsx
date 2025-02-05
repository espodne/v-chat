import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'peerjs';
import Controls from './Controls';
import Chat from './Chat';

const VideoChat: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [myVideoStream, setMyVideoStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoGridRef = useRef<HTMLDivElement>(null);
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<ReturnType<typeof io>>();
  const peerRef = useRef<Peer>();

  // Инициализация медиапотока
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: isVideoOn })
      .then((stream) => {
        setMyVideoStream(stream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });
  }, [isVideoOn]);

  // Обновление состояния видео
  useEffect(() => {
    if (myVideoStream) {
      const videoTrack = myVideoStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOn;
      }
    }
  }, [isVideoOn, myVideoStream]);

  // Обновление состояния звука
  useEffect(() => {
    if (myVideoStream) {
      const audioTrack = myVideoStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMuted;
      }
    }
  }, [isMuted, myVideoStream]);

  // Инициализация PeerJS и Socket.IO
  useEffect(() => {
    socketRef.current = io('http://localhost:3000', {
      transports: ['polling', 'websocket'],
    });

    peerRef.current = new Peer(undefined, {
      path: '/peerjs',
      host: 'localhost',
      port: 3000, // Исправлено на 3000
      secure: false,
    });

    peerRef.current.on('open', (id) => {
      socketRef.current?.emit('join-room', roomId, id);
    });

    peerRef.current.on('call', (call) => {
      call.answer(myVideoStream || undefined);
      const video = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        addVideoStream(userVideoStream);
      });
    });

    socketRef.current.on('user-connected', (userId) => {
      if (myVideoStream) {
        connectToNewUser(userId, myVideoStream);
      }
    });

    return () => {
      socketRef.current?.disconnect();
      peerRef.current?.destroy();
    };
  }, [roomId, myVideoStream]);

  const connectToNewUser = (userId: string, stream: MediaStream) => {
    const call = peerRef.current?.call(userId, stream);
    const video = document.createElement('video');
    call?.on('stream', (userVideoStream) => {
      addVideoStream(userVideoStream);
    });
  };

  const addVideoStream = (stream: MediaStream) => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });
    videoGridRef.current?.append(video);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="video-chat">
      <div ref={videoGridRef}>
        <video ref={myVideoRef} muted autoPlay playsInline />
      </div>
      <Controls
        toggleVideo={toggleVideo}
        toggleAudio={toggleAudio}
        isVideoOn={isVideoOn}
        isMuted={isMuted}
      />
      <Chat />
    </div>
  );
};

export default VideoChat;