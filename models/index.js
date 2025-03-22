const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Order = require('./Order');

// Definir relaciones
User.hasMany(Order, {
    foreignKey: 'user_id'
});
Order.belongsTo(User, {
    foreignKey: 'user_id'
});

module.exports = {
    User,
    Order,
    sequelize
};



