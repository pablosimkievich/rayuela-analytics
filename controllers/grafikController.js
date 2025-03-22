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

            // Format the dates properly
            const chartData = orders.map(order => {
                // Convert the raw order data to a plain object
                const plainOrder = order.get({ plain: true });
                return {
                    id: plainOrder.id,
                    amount: parseFloat(plainOrder.order_total_amt),
                    date: plainOrder.order_date,  // This will be a simple date string
                    status: plainOrder.order_status
                };
            });

            console.log('Chart data sample:', chartData[0]); // Debug log

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
    },
    ventasPorProducto: async (req, res) => {
        try {
            console.log('Starting ventasPorProducto controller');
            
            if (!db || !db.OrderDetail || !db.Product) {
                throw new Error('Models not properly initialized');
            }

            console.log('Models validated, executing query...');

            // Get total quantity sold per product with error handling
            const results = await db.OrderDetail.findAll({
                attributes: [
                    'fk_product_id',
                    [db.sequelize.fn('SUM', db.sequelize.col('quantity')), 'total_quantity']
                ],
                include: [{
                    model: db.Product,
                    attributes: ['name'],
                    required: true
                }],
                group: ['fk_product_id', 'Product.id', 'Product.name'],
                order: [[db.sequelize.fn('SUM', db.sequelize.col('quantity')), 'DESC']]
            }).catch(err => {
                console.error('Database query error:', err);
                throw new Error(`Database query failed: ${err.message}`);
            });

            if (!results || results.length === 0) {
                console.log('No sales data found');
                return res.render('grafik/ventas-por-producto', {
                    data: { 
                        labels: [], 
                        values: [],
                        totalSold: 0 
                    },
                    title: 'Ventas por Producto',
                    message: 'No hay datos de ventas disponibles'
                });
            }

            // Calculate total products sold
            const totalSold = results.reduce((sum, item) => 
                sum + parseInt(item.dataValues.total_quantity || 0), 0);

            // Format data for the chart
            const chartData = {
                labels: results.map(item => item.Product ? item.Product.name : 'Producto Desconocido'),
                values: results.map(item => parseInt(item.dataValues.total_quantity) || 0),
                totalSold: totalSold
            };

            console.log('Chart data prepared:', {
                labelCount: chartData.labels.length,
                valueCount: chartData.values.length,
                totalSold: chartData.totalSold
            });

            return res.render('grafik/ventas-por-producto', {
                data: chartData,
                title: 'Ventas por Producto'
            });

        } catch (error) {
            console.error('Error in ventasPorProducto:', error);
            return res.status(500).json({
                error: 'Error al obtener los datos de ventas por producto',
                details: error.message
            });
        }
    }
};








