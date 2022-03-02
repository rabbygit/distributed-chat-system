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

const pubClient = new Redis({
  port: 6379, // Redis port
  host: 'redis_socket_1', // Redis host
  password: 'user123'
});

const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

io.on('connection', async(socket) => {
  try {
    // notify the registry service that one connection is established
    console.log('a user connected');
    const response = await axios.get('http://registry_nginx:80/user_connected?host=http://127.0.0.1:5001');
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
      console.log('a user connected');
      const response = await axios.get('http://registry_nginx:80/user_disconnected?host=http://127.0.0.1:5002');
      console.log(response);
    } catch (error) {
      console.log(error);
    }
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