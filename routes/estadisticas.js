const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('estadisticas/index', {
        title: 'Estadísticas'
    });
});

module.exports = router;