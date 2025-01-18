const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./settings/mongodb');
const errorHandler = require('./middlewares/errorHandler');
const userRoutes = require('./routes/userRoute');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4201;

// Conectar a MongoDB
connectDB();

// Middleware
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));

// Configuración de CORS
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

// Rutas
app.use('/api', userRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

// Arrancar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
