const Sequelize = require('sequelize');

const sequelize = new Sequelize('rayuela', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;