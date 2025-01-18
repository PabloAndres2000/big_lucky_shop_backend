const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

// Esquema de usuario
const userSchema = new mongoose.Schema({
  name: String,
  last_name: String,
  email: { type: String, unique: true },
  rol: String,
  is_active: Boolean,
});

// Modelo de Usuario
const User = mongoose.model('User', userSchema);

// Función para generar usuarios falsos
function generateFakeUsers(count) {
  const fakeUsers = [];

  for (let i = 1; i <= count; i++) {
    fakeUsers.push({
      name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(), // Genera emails únicos
      rol: i % 2 === 0 ? 'admin' : 'user', // Alterna entre admin y user
      is_active: true,
    });
  }

  return fakeUsers;
}

// Función para crear usuarios en lotes para evitar timeouts
async function createUsersInBatches(batchSize, totalUsers) {
  const totalBatches = Math.ceil(totalUsers / batchSize);

  for (let i = 0; i < totalBatches; i++) {
    const usersBatch = generateFakeUsers(batchSize); // Genera el lote de usuarios

    try {
      // Inserta los usuarios en MongoDB en cada lote
      const result = await User.insertMany(usersBatch, { ordered: false });
      console.log(
        `Lote ${i + 1} de ${totalBatches} insertado: ${result.length} usuarios.`
      );
    } catch (err) {
      console.error(`Error al insertar el lote ${i + 1}:`, err);
    }
  }

  console.log('Usuarios creados correctamente');
}

// Conectar a la base de datos
mongoose
  .connect('mongodb://admin:adminpassword@localhost:27017/big_lucky_shop_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    socketTimeoutMS: 60000, // Aumenta el tiempo de espera para operaciones
    serverSelectionTimeoutMS: 60000,
  })
  .then(() => {
    console.log('Conectado a MongoDB');
    // Crea los usuarios en lotes de 500
    createUsersInBatches(500, 13000); // Lotes de 500 usuarios
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });
