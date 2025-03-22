const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SecondaryImages = sequelize.define('SecondaryImages', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_product: {
        type: DataTypes.INTEGER
    },
    image_2: {
        type: DataTypes.STRING
    },
    image_3: {
        type: DataTypes.STRING
    },
    image_4: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'secondary_images',
    timestamps: false
});

module.exports = SecondaryImages;
