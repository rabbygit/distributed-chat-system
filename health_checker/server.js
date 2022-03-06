const axios = require('axios');
const Redis = require("ioredis")
const express = require('express');
const e = require('express');
const app = express()
const INTERVAL = Number(process.env.interval) || 2

// connect to redis cluster through redis sentinel
const redis = new Redis({
  sentinels: [
    { host: process.env.redis_host, port: 26379 },
    { host: process.env.redis_host, port: 26380 },
    { host: process.env.redis_host, port: 26381 },
  ],
  name: "mymaster",
});

const checker = async (host) => {
  try {

    // It's not needed when socket server will be in different host machine
    let url = ''
    if (host.includes('5001')) {
      url = 'http://socket_1:5001/'
    } else {
      url = 'http://socket_2:5002/'
    }

    await axios.get(url)
    console.log(`${host} is alive`)
  } catch (error) {
    // update redis store
    console.log(`Unable to reach the server ${host}`)
    console.log(error)
    await redis.zrem("sortedHosts", host)

    // maybe email adminstator
  }
}

/**
 * @description get all socket hosts from redis and check if they are alive
 */
setInterval(async () => {
  try {
    const hosts = await redis.zrange("sortedHosts", 0, -1)
    for (let index = 0; index < hosts.length; index++) {
      await checker(hosts[index])
    }
  } catch (error) {
    console.log('Error during health check');
  }
}, 10000 * INTERVAL)



app.listen(8000, () => {
  console.log(`Health checker app listening on port 8000`)
})