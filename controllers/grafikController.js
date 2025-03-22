const db = require('../models');

module.exports = {
    compradoresNoCompradores: async (req, res) => {
        try {
            // Obtener el total de usuarios
            const totalUsuarios = await db.User.count();
            
            // Obtener usuarios que han realizado compras (compradores únicos)
            const compradores = await db.User.count({
                distinct: true,
                include: [{
                    model: db.Order,
                    required: true
                }]
            });

            // Calcular no compradores
            const noCompradores = totalUsuarios - compradores;

            const data = {
                labels: ['Compradores', 'No Compradores'],
                values: [compradores, noCompradores]
            };

            res.render('grafik/compradores-no-compradores', { data });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Error al obtener los datos');
        }
    }
};

