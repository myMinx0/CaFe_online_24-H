const express = require("express");
const socketio = require("socket.io");
const app = express();
const path = require('path');
const { connect } = require("http2");
const vipSet = new Set();
// ...

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.render("index");
});

app.get('/postStatus', (req, res) => {
  console.log("Received request for /postStatus");
  res.render("postStatus"); // เปลี่ยนเป็น res.render และใช้ชื่อเท็มเพลต
});





app.get("/index", (req, res) => {
  console.log("Received request for /postStatus");
  res.sendFile(path.join(__dirname, 'views', 'index.ejs'));
});



const server = app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running...");
});

// Initialize socket for the server
const io = socketio(server);

io.on("connection", (socket) => {
  console.log("New user connected");



  socket.on("change_username", (data) => {
    // Leave any existing rooms before joining the new room
    socket.leaveAll();


    
    socket.username = data.username;
    socket.join("room1"); // Set the room name to "room1" or any desired name
    console.log(`User ${socket.id} (${socket.username}) joined room1`);
    
    // Broadcast a message to all clients in the room
    io.to("room1").emit("receive_message", {
      message: `${socket.username} เข้าร่วมห้องแชท`,
      username: "System",
    });
  });

  socket.on("new_message", (data) => {
    console.log(`Received new message from ${socket.id} (${socket.username}): ${data.message}`);
    // Broadcast the message to all clients in the room
    io.to("room1").emit("receive_message", {
      message: data.message,
      username: socket.username,
    });
  });
  


  socket.on("post_status", (data) => {
    console.log("Received post_status:", data);
    io.to("room1").emit("receive_status", {
      status: data.status,
      username: socket.username,
    });
  });

socket.on("receive_status", (data) => {
    console.log("Received receive_status:", data);
    if (data.username && data.status) {
        var statusBox = document.getElementById('status-box');
        statusBox.innerHTML += '<p><strong>' + data.username + ':</strong> ' + data.status + '</p>';
        statusBox.scrollTop = statusBox.scrollHeight;
    }
});





  socket.on('disconnect', () => {
    console.log(`User ${socket.id} (${socket.username}) disconnected`);
    // Handle logout event, e.g., remove username from the room
    if (socket.username) {
      io.to("room1").emit("receive_message", {
        message: `${socket.username} ออกจากห้องแชท`,
        username: "System",
      });
    }
  });
});


