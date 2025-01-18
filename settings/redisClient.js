const redis = require('redis');

// Crear el cliente
const client = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${
    process.env.REDIS_PORT || 6379
  }`,
});

client.on('connect', () => {
  console.log('Conectado a Redis');
});

client.on('error', (err) => {
  console.error('Error en Redis:', err);
});

// Función para conectar a Redis de manera asíncrona
async function connectRedis() {
  try {
    await client.connect(); // Aseguramos que se conecte antes de usarlo
    console.log('Cliente Redis conectado correctamente');
  } catch (error) {
    console.error('Error al conectar con Redis:', error);
  }
}

// Conectar al inicio de la aplicación
connectRedis();

module.exports = client;
