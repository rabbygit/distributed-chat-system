const express = require('express');
const app = express();
const cors = require('cors')
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter")
const Redis = require("ioredis")
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
});

const pubClient = new Redis({
  port: 6379, // Redis port
  host: 'redis_socket_1', // Redis host
  password: 'user123'
});

const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on("disconnect", () => {
    // ...
  });
});

app.use(cors())

app.get('/', async (req, res) => {
  try {
    res.json({
      status: true,
      message: 'Hello from socket_1'
    })
  } catch (error) {
    console.log('Some error occured');
    console.log(error)
    res.send('Some error occured from socket_1!')
  }
})

server.listen(5001, () => {
  console.log('listening on *:5001');
});