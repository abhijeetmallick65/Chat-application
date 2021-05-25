const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages.js");
const {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
} = require("./utils/users.js");
// calling "express funtion" will generate a new express application that we store in "app"
const app = express();
// create http server using express app
const server = http.createServer(app);
// connect socket.io to http server
const io = socketio(server);

const public = `${__dirname}/../public`;
const port = process.env.PORT || 3000;

// serving static files
app.use(express.static(public));

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  // join
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    // join the room
    socket.join(user.room);

    // welcom users to the room
    socket.emit(
      "message",
      generateMessage("Welcome to the room : " + user.room)
    );

    // send event
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(`${user.username} has joined the chat.`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });
    callback();
  });

  // message
  // catch event
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    // send event
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profane language not allowed");
    }
    if (user)
      io.to(user.room).emit("message", generateMessage(message, user.username));
    callback();
  });

  // location
  socket.on("sendLocation", (positions, callback) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "locationMessage",
        generateLocationMessage(
          user.username,
          `https://google.com/maps?q=${positions.latitude},${positions.longitude}`
        )
      );
    }
    callback();
  });

  // leave
  // disconnect client from the socket.io server
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left the room !`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInRoom(user.room),
      });
    }
  });
});
//server listens to port
server.listen(port, () => {
  console.log("app is listening");
});
