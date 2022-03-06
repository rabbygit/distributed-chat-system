const express = require('express');
const cors = require('cors')
const http = require('http');
const axios = require('axios')
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter")
const Redis = require("ioredis")

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
});

// connect to redis cluster through redis sentinel
const pubClient = new Redis({
  sentinels: [
    { host: process.env.redis_host, port: 26379 },
    { host: process.env.redis_host, port: 26380 },
    { host: process.env.redis_host, port: 26381 },
  ],
  name: "mymaster",
});

const subClient = pubClient.duplicate();

// socket io adapter, it manages the massages among different socket nodes through redis
io.adapter(createAdapter(pubClient, subClient));

io.on('connection', async (socket) => {
  try {
    // increase host connection count
    console.log('a user connected');
    await pubClient.zincrby("sortedHosts", 1, 'http://127.0.0.1:5001')
  } catch (error) {
    console.log(error);
  }

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on("disconnect", async () => {
    // decrease host connection count
    try {
      console.log('a user disconnected');
      await pubClient.zincrby("sortedHosts", -1, 'http://127.0.0.1:5001')
    } catch (error) {
      console.log(error);
    }
  });
});

// allow cors policy
app.use(cors())

app.get('/', (req, res) => {
  res.json({
    status: true,
    message: 'Hello from socket_1'
  })
})

// start listening
server.listen(5001, () => {
  console.log('listening on *:5001');
});