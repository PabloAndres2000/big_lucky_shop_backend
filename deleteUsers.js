const mongoose = require('mongoose');

// Conexión a MongoDB (asegúrate de tener una URL válida)
mongoose
  .connect('mongodb://localhost:27017/big_lucky_shop_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.log('Error al conectar a MongoDB:', err));

// Define el esquema de usuario
const userSchema = new mongoose.Schema({
  name: String,
  last_name: String,
  email: { type: String, unique: true },
  rol: String,
  is_active: Boolean,
});

// Crea el modelo de usuario
const User = mongoose.model('User', userSchema);

// Función para eliminar usuarios en lotes
async function deleteUsers() {
  try {
    const batchSize = 5000; // Cantidad de usuarios a eliminar por iteración
    let totalDeleted = 0;

    // Bucle para eliminar usuarios en lotes
    while (true) {
      const usersToDelete = await User.find({ is_active: true }).limit(
        batchSize
      ); // Buscar usuarios
      if (usersToDelete.length === 0) break; // Salir si no hay más usuarios que eliminar

      const userIds = usersToDelete.map((user) => user._id); // Obtener los _id de los usuarios
      const result = await User.deleteMany({ _id: { $in: userIds } }); // Eliminar usuarios por sus _id
      totalDeleted += result.deletedCount;

      console.log(
        `Eliminados ${result.deletedCount} usuarios en esta iteración.`
      );
    }

    console.log(`Total de usuarios eliminados: ${totalDeleted}`);
  } catch (err) {
    console.error('Error al eliminar usuarios:', err);
  } finally {
    mongoose.connection.close(); // Cierra la conexión
  }
}

// Llama a la función para eliminar usuarios
deleteUsers();
