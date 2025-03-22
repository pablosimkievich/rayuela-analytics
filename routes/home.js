const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('home/index', {
        title: 'Rayuela Analytics - Home'
    });
});

module.exports = router;