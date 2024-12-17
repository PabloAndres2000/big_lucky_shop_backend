const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const port = process.env.port || 4201;

// const clientRouter = require('./routes/clientRoute');
const userRoutes = require('./routes/userRoute');

app.use(bodyparser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyparser.json({ limit: '50mb', extended: true }));

// Conexión a MongoDB y arranque del servidor
mongoose
  .connect('mongodb://localhost:27017/big_lucky_shop_db', {})
  .then(() => {
    console.log('Conectado a MongoDB');

    // Solo arrancar el servidor si la conexión a la base de datos es exitosa
    app.listen(port, () => {
      console.log(`Backend corriendo en el puerto ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err);
  });

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Access-Control-Allow-Request-Method'
  );
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Allow', 'GET, PUT, POST, DELETE, OPTIONS');
  next();
});

// Prefijo generalizado para la API
app.use('/api', [userRoutes]);

app.use(errorHandler);
module.exports = app;
