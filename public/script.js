const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
const muteButton = document.getElementById("stopVideo");

let videoBtn = true;
let myVideoStream;

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3000",
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
        video.play();
        videoGrid.append(video);
    });
};

// Функция для переключения состояния видео
const toggleVideo = async () => {
    if (!myVideoStream) return;

    videoBtn = !videoBtn; // Переключаем состояние

    const videoTrack = myVideoStream.getVideoTracks()[0];

    if (videoTrack) {
        videoTrack.enabled = videoBtn;
    }

    console.log('Видео ' + (videoBtn ? 'включено' : 'выключено'));
};

// Обработчик события для кнопки
muteButton.addEventListener("click", () => {
    toggleVideo();
});