const express = require('express');
const cors = require('cors')
const http = require('http');
const axios = require('axios')
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const { createAdapter } = require("./adapater")
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


const notify_new_connection = async () => {
  try {
    // increase host connection count
    console.log('a user connected');
    await pubClient.zincrby("sortedHosts", 1, 'http://127.0.0.1:5001')
  } catch (error) {
    console.log(error);
  }

}

const notify_disconnect = async () => {
  try {
    console.log('a user disconnected');
    await pubClient.zincrby("sortedHosts", -1, 'http://127.0.0.1:5001')
  } catch (error) {
    console.log(error);
  }
}

// to demonstrate group chat, 
const add_to_groupchat = async (groupKey, user_id) => {
  try {
    await pubClient.sadd(`group_chat:${groupKey}`, user_id);
    console.log(`${user_id} added to group_chat:${groupKey}`)
  } catch (error) {
    console.error(error)
  }
}

const getChatMembersOfGroupChat = async (groupKey) => {
  try {
    return await pubClient.smembers(`group_chat:${groupKey}`);
  } catch (error) {
    console.error(error)
  }
}


io.use((socket, next) => {
  const id = socket.handshake.auth.id;
  if (!id) {
    return next(new Error("invalid user id"));
  }
  socket.user_id = id;
  console.log("From middleware....")
  next();
});

io.on('connection', async (socket) => {
  notify_new_connection()
  add_to_groupchat('system_design',socket.user_id)

  // it will create a channel by user_id
  socket.join(socket.user_id)

  socket.on('private message', ({ content, to }) => {
    // publish message to the receiver channel
    io.to(to).emit('private message', { content, from: socket.user_id });
  });

  socket.on('group message', async({ content }) => {
    const members = await getChatMembersOfGroupChat('system_design')
    members.forEach(to => {
      // publish message to every connected group member's channel
      io.to(to).emit('group message', { content, from: socket.user_id });
    });
  });

  socket.on("disconnect", () => {
    socket.leave(socket.user_id);
    // decrease host connection count
    notify_disconnect()
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