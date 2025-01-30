import express from "express"; // Используем import вместо require
import { v4 as uuidv4 } from "uuid";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";

const app = express();
const server = (await import("http")).createServer(app); // Динамический импорт для http
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
const io = new Server(server);

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
    socket.to(roomId).emit("user-connection", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-connection", userId);
    });
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
