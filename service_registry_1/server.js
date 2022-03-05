const express = require('express')
const cors = require('cors')
const app = express()
const Redis = require("ioredis")
const port = 3000

app.use(cors())

// connect to redis cluster through redis sentinel
const redis = new Redis({
  sentinels: [
    { host: process.env.redis_host, port: 26379 },
    { host: process.env.redis_host, port: 26380 },
    { host: process.env.redis_host, port: 26381 },
  ],
  name: "mymaster",
});

app.get('/', async (req, res) => {
  try {
    const host = await redis.zrange("sortedHosts", 0, 0)

    if (host) {
      return res.json({
        status: true,
        host: host[0]
      })
    }

    res.json({
      success: false,
      message: 'No host found. please add one!'
    })
  } catch (error) {
    console.log('Some error occured');
    console.log(error)
    res.send('Some error occured from service_registry_1!')
  }
})

// Add the socket server address to redis
app.get('/add_socket', async (req, res) => {
  try {
    const { host } = req.query;

    if (!host) {
      return res.status(400).json({
        status: false,
        message: 'Host required!'
      })
    }

    await redis.zadd("sortedHosts", 0, host)

    res.status(200).json({
      status: true,
      message: 'Host added!'
    })
  } catch (error) {
    console.log('Some error occured');
    console.log(error)
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    })
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})