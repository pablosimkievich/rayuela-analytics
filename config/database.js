const Sequelize = require('sequelize');

const sequelize = new Sequelize('sql5754365', 'sql5754365', 'LFALEV3tDB', {
  host: 'sql5.freesqldatabase.com',
  dialect: 'mysql'
});

module.exports = sequelize;