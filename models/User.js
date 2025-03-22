const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_first_name: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    user_last_name: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    user_mail: {
        type: DataTypes.STRING(45),
        allowNull: false,
        unique: true
    },
    user_cel: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    user_address: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    user_img: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    dni: {
        type: DataTypes.STRING(45),
        allowNull: false
    }
}, {
    tableName: 'users',
    timestamps: false
});

module.exports = User;
