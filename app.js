const express = require('express');
const path = require('path');
const { sequelize, User, Order } = require('./models');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// Configuración
app.set('view engine', 'ejs');
app.set('views', 'views');

// Configuración de express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

app.use(express.static(path.join(__dirname, 'public')));

// Sync database
sequelize.sync()
    .then(() => {
        console.log('Database synced successfully');
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });

// Rutas
app.use('/', require('./routes/home'));
app.use('/graficos', require('./routes/grafik'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});


