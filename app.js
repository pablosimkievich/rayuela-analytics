const express = require('express');
const path = require('path');
const sequelize = require('./config/database');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// Configuración
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/', require('./routes/home'));
app.use('/grafik', require('./routes/grafik'));
app.use('/estadisticas', require('./routes/estadisticas'));

// Prueba de conexión a la base de datos
sequelize.authenticate()
  .then(() => console.log('Conexión a la base de datos establecida'))
  .catch(err => console.error('Error conectando a la base de datos:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});


