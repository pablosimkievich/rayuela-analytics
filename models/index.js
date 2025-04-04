const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Order = require('./Order');
const OrderDetail = require('./OrderDetail');
const Product = require('./Product');
const SecondaryImages = require('./SecondaryImages');
const Category = require('./Category');

// Definir relaciones
User.hasMany(Order, {
    foreignKey: 'user_id'
});
Order.belongsTo(User, {
    foreignKey: 'user_id'
});

// Add OrderDetail relationships
OrderDetail.belongsTo(Product, {
    foreignKey: 'fk_product_id'
});
Product.hasMany(OrderDetail, {
    foreignKey: 'fk_product_id'
});

// Add Category relationships
Category.hasMany(Product, {
    as: 'products',
    foreignKey: 'category_id'
});
Product.belongsTo(Category, {
    foreignKey: 'category_id'
});

module.exports = {
    User,
    Order,
    OrderDetail,
    Product,
    SecondaryImages,
    Category,
    sequelize
};
