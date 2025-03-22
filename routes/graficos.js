const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const grafikController = require('../controllers/grafikController');

router.get('/', (req, res) => {
    res.render('graficos/index', {
        title: 'Gráficos'
    });
});

router.get('/lineas', async (req, res) => {
    try {
        const [results] = await sequelize.query(
            'SELECT fecha, valor FROM mediciones ORDER BY fecha'
        );
        
        res.render('graficos/lineas', {
            title: 'Gráfico de Líneas',
            data: results
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener datos');
    }
});

router.get('/productos-precio', async (req, res) => {
    try {
        const [results] = await sequelize.query(
            'SELECT name, price FROM products ORDER BY price DESC'
        );
        
        res.render('graficos/productos-precio', {
            title: 'Productos por Precio',
            data: results
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener datos de productos');
    }
});

router.get('/compradores-no-compradores', grafikController.compradoresNoCompradores);

module.exports = router;