const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Medicion = sequelize.define('Medicion', {
    fecha: {
        type: DataTypes.DATE,
        allowNull: false
    },
    valor: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Medicion;