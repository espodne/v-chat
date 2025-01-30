import express from "express";
import { v4 as uuidv4 } from "uuid";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";
import cors from "cors";
import http from "http"; 

const app = express();


app.use(cors({
  origin: "*", 
  methods: ["GET", "POST"],
  allowedHeaders: ["my-custom-header"],
  credentials: true
}));

const server = http.createServer(app); 
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  },
  transports: ["polling", "websocket"]
});

app.use("/peerjs", peerServer);
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId); 

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});