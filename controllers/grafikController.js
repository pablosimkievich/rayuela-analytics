const db = require('../models');

module.exports = {
    compradoresNoCompradores: async (req, res) => {
        try {
            console.log('Starting compradoresNoCompradores controller');
            
            // Verificar que db y sus modelos estén disponibles
            if (!db || !db.User || !db.Order) {
                throw new Error('Models not properly initialized');
            }

            // Obtener el total de usuarios
            const totalUsuarios = await db.User.count()
                .catch(err => {
                    console.error('Error counting users:', err);
                    throw new Error('Failed to count users');
                });
            console.log('Total usuarios:', totalUsuarios);
            
            // Obtener usuarios que han realizado compras (compradores únicos)
            const compradores = await db.User.count({
                distinct: true,
                include: [{
                    model: db.Order,
                    required: true
                }]
            }).catch(err => {
                console.error('Error counting buyers:', err);
                throw new Error('Failed to count buyers');
            });
            console.log('Total compradores:', compradores);

            // Validar que los números sean válidos
            if (typeof totalUsuarios !== 'number' || typeof compradores !== 'number') {
                throw new Error('Invalid count results');
            }

            // Calcular no compradores
            const noCompradores = totalUsuarios - compradores;
            console.log('No compradores:', noCompradores);

            const chartData = {
                labels: ['Compradores', 'No Compradores'],
                values: [compradores, noCompradores]
            };

            console.log('Sending chart data:', chartData);

            return res.render('grafik/compradores-no-compradores', { 
                data: chartData,
                title: 'Compradores vs No Compradores' 
            });

        } catch (error) {
            console.error('Error detallado en el controlador:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            return res.status(500).json({
                error: 'Error al obtener los datos',
                details: error.message
            });
        }
    },
    montoPorCompra: async (req, res) => {
        try {
            console.log('Starting montoPorCompra controller');
            
            if (!db || !db.Order) {
                throw new Error('Models not properly initialized');
            }

            // Get summary statistics
            const results = await db.Order.findAll({
                attributes: [
                    [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'totalOrders'],
                    [db.sequelize.fn('SUM', db.sequelize.col('order_total_amt')), 'totalAmount']
                ]
            });

            // Get individual orders for the chart, ordered by date
            const orders = await db.Order.findAll({
                attributes: [
                    'id', 
                    'order_total_amt',
                    'order_date',
                    'order_status'
                ],
                order: [['order_date', 'ASC']]
            });

            const stats = {
                totalOrders: results[0].dataValues.totalOrders,
                totalAmount: Number(results[0].dataValues.totalAmount).toFixed(2)
            };

            const chartData = orders.map(order => ({
                id: order.id,
                amount: Number(order.order_total_amt),
                date: order.order_date,
                status: order.order_status
            }));

            console.log('Order statistics:', stats);

            return res.render('grafik/monto-por-compra', {
                data: stats,
                chartData: chartData,
                title: 'Monto por Compra'
            });

        } catch (error) {
            console.error('Error en montoPorCompra:', error);
            return res.status(500).json({
                error: 'Error al obtener los datos de órdenes',
                details: error.message
            });
        }
    }
};



