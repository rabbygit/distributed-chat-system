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

io.adapter(createAdapter(pubClient, subClient));

io.on('connection', async(socket) => {
  try {
    // notify the registry service that one connection is established
    console.log('a user connected');
    const response = await axios.get('http://registry_nginx:80/user_connected?host=http://127.0.0.1:5002');
    console.log(response);
  } catch (error) {
    console.log(error);
  }
  
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on("disconnect", async() => {
    // notify the registry service that one connection is lost
    try {
      console.log('a user disconnected');
      const response = await axios.get('http://registry_nginx:80/user_disconnected?host=http://127.0.0.1:5002');
      console.log(response);
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
    message: 'Hello from socket_2'
  })
})

// start listening
server.listen(5002, () => {
  console.log('listening on *:5002');
});