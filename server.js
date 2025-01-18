const express = require('express');
const connectDB = require('./settings/mongodb'); // Ruta al archivo de conexión
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4201;

// Conexión a MongoDB
connectDB();

// Middlewares
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
