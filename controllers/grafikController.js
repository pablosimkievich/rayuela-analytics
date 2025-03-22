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
    }
};

