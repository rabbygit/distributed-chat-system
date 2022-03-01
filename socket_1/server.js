const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('a user connected');
});

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