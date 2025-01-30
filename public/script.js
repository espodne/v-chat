const socket = io("https://1d95-45-95-233-185.ngrok-free.app", {
    transports: ["polling", "websocket"]
});
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
const muteButton = document.getElementById("stopVideo");

let videoBtn = true;
let myVideoStream;

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "1d95-45-95-233-185.ngrok-free.app",
    secure: true
});
 
navigator.mediaDevices.getUserMedia({
    audio: true,
    video: videoBtn,
}).then((stream) => {
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
        video.play().catch(erroe => {
            console.warn('Error ttempting play', erroe)
        });
        videoGrid.append(video);
    });
};


const toggleVideo = async () => {
    if (!myVideoStream) return;

    videoBtn = !videoBtn;

    const videoTrack = myVideoStream.getVideoTracks()[0];

    if (videoTrack) {
        videoTrack.enabled = videoBtn;
    }

    console.log('Видео ' + (videoBtn ? 'включено' : 'выключено'));
};

muteButton.addEventListener("click", () => {
    toggleVideo();
});