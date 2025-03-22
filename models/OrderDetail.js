const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderDetail = sequelize.define('OrderDetail', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fk_order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fk_product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fk_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'order_detail',
    timestamps: false
});

module.exports = OrderDetail;