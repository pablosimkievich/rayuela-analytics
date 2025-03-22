const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category_name: {
        type: DataTypes.STRING
    },
    category_descri: {
        type: DataTypes.STRING
    },
    category_img: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'category',
    timestamps: false
});

module.exports = Category;
