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
    const { username } = req.body;

    // validation logic
    if (!username) {
      return res.status(400).json({
        status: false,
        message: 'username required'
      })
    }

    // find user with this username
    const found_user = await db.users.findOne({
      attributes: ['id'],
      where: {
        username,
      }
    })

    if (found_user) {
      return res.status(409).json({
        status: false,
        message: 'user already exists with this username. Try with another one!'
      })
    }

    // insert into db
    const user = await db.users.create({
      username,
    })

    // response
    res.status(200).json({
      status: true,
      message: 'user signup successfully',
      user: {
        id: user.id,
        username: username
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: true,
      message: 'Internal server error'
    })
  }
})

app.get('/users', async (req, res) => {
  try {
    const users = await db.users.findAll({
      attributes: ['id', 'username']
    })

    // response
    res.status(200).json({
      status: true,
      message: 'user signup successfully',
      users
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
