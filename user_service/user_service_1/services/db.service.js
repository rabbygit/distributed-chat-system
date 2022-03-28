/**
 * @description Model defiantion and model relations
 */

// Dependencies
const Sequelize = require("sequelize");

const sequelize = new Sequelize('chat_users', '', '', {
  host: 'localhost',
  dialect: 'mysql',

  query: {
    raw: true,
    logging: false,
  },

  logging: false,

  pool: {
    max: 100,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Models
db.users = require("../models/user")(sequelize, Sequelize);

module.exports = db;