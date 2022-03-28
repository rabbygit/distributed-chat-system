const express = require('express')
const cors = require('cors')
const app = express()
const db = require('./services/db.service')
const port = 3000

app.use(cors())
app.use(express.json());

// user signup
app.post('/sign_up', async (req, res) => {
  try {
    const { username, password } = req.body;

    // validation logic
    if (!username || !password) {
      return res.status(400).json({
        status: false,
        message: 'username and password required'
      })
    }

    // find user with this username
    const user = await db.users.findOne({
      where: {
        username,
      }
    })

    if (user) {
      return res.status(409).json({
        status: false,
        message: 'user already exists with this username. Try with another one!'
      })
    }

    // insert into db
    await db.users.create({
      username,
      password // you should never keep password in plain text in production
    })

    // response
    res.status(200).json({
      status: true,
      message: 'user signup successfully'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: true,
      message: 'Internal server error'
    })
  }
})

// user login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // validation logic
    if (!username || !password) {
      return res.status(400).json({
        status: false,
        message: 'username and password required'
      })
    }

    // find user with this username
    const user = await db.users.findOne({
      where: {
        username,
        password
      }
    })

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'user not found'
      })
    }

    res.status(200).json({
      status: true,
      user
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: true,
      message: 'Internal server error'
    })
  }
})

// db connection
db.sequelize
  .sync({
    logging: false,
    alter: true,
  })
  .then(() => {
    console.log("Database connection established successfully");

    // Start server
    app.listen(port, () => {
      console.log(`user_service_1 is listening on port ${port}`)
    })
  })
  .catch((error) => console.error(error));
