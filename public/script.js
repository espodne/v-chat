const socket = io("http://localhost:3000", {
  transports: ["polling", "websocket"],
});
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
const muteButton = document.getElementById("stopVideo");

let isVideoOn = true;
let myVideoStream;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "localhost:3000",
  secure: true,
});

navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: isVideoOn,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play().catch((erroe) => {
      console.warn("Error ttempting play", erroe);
    });
    videoGrid.append(video);
  });
};

const toggleVideo = async () => {
  if (!myVideoStream) return;

  isVideoOn = !isVideoOn;

  const videoTrack = myVideoStream.getVideoTracks()[0];

  if (videoTrack) {
    videoTrack.enabled = isVideoOn;
  }

  const videoIcon = muteButton.querySelector("i");
  if (isVideoOn) {
    videoIcon.classList.remove("fa-video-slash");
    videoIcon.classList.add("fa-video-camera");
    muteButton.classList.remove("options__button-video-mute");
  } else {
    videoIcon.classList.remove("fa-video-camera");
    videoIcon.classList.add("fa-video-slash");
    muteButton.classList.add("options__button-video-mute");
  }
};

muteButton.addEventListener("click", () => {
  toggleVideo();
});
