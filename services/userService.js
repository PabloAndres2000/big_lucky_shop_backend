const TokenService = require('../helpers/jwt');
const { User } = require('../models/User/userModel');
const bcrypt = require('bcrypt-nodejs');
const { NotFoundError } = require('../middlewares/errors');
const mongoose = require('mongoose');

class UserService {
  async createUserAdmin(data) {
    try {
      const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(data.password, null, null, (err, hash) => {
          if (err) {
            return reject(err);
          }
          resolve(hash);
        });
      });

      const newUser = new User({
        ...data,
        password: hashedPassword,
      });

      return await newUser.save();
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        // Lanza un error de tipo NotFoundError si el usuario no se encuentra
        throw new NotFoundError('Usuario no encontrado');
      }

      const isMatch = await new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result);
        });
      });

      if (!isMatch) {
        throw new Error('Usuario o contraseña incorrectos');
      }

      const token = TokenService.createAccessToken(user);

      return { token, user };
    } catch (error) {
      throw error;
    }
  }

  async getAllUsersAdmin(filter = '') {
    try {
      const regex = new RegExp(filter, 'i');
      const users = await User.find({
        $or: [
          { name: { $regex: regex } },
          { last_name: { $regex: regex } },
          { email: { $regex: regex } },
        ],
      }).select('-password');

      if (!users || users.length === 0) {
        throw new Error('No se encontraron usuarios en la base de datos.');
      }

      return users;
    } catch (error) {
      throw new Error(`Error al obtener los usuarios: ${error.message}`);
    }
  }

  async getUserById(id = '') {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID no es válido');
      }
      const user = await User.findOne({ _id: id }).select('-password -token');

      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      throw new Error(`Error al obtener el usuario: ${error.message}`);
    }
  }

  async updateUserById(id = '', updateData = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID no valido');
      }

      const updateUser = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-token');

      if (!updateUser) {
        throw new Error('Usuario no encontrado');
      }

      return updateUser;
    } catch (error) {
      console.error('Error al actualizar el usuario:', error.message);
      throw error;
    }
  }

  async exportAllUsersByExcel(redisClient, progressKey) {
    const pageSize = 100;
    const allUsersData = [];
    console.time('Tiempo total de ejecución');

    try {
      const totalUsers = await User.countDocuments();
      await redisClient.set(
        progressKey,
        JSON.stringify({ progress: 0, status: 'processing' })
      );

      const cursor = User.find({})
        .select('name last_name email rol is_active')
        .batchSize(pageSize)
        .lean()
        .cursor();

      let processedUsers = 0;

      // Función auxiliar para procesar un usuario
      const processUser = (user) => ({
        Nombre: user.name,
        Apellido: user.last_name,
        Correo: user.email,
        Rol: user.rol,
        Estado: user.is_active,
      });

      // Función para agregar un delay (si lo necesitas)
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      // Iterar sobre el cursor y procesar usuarios
      for (
        let user = await cursor.next();
        user != null;
        user = await cursor.next()
      ) {
        console.log('Procesando usuario:', user);

        allUsersData.push(processUser(user));
        processedUsers++;

        // Actualizar el progreso en Redis en función de los usuarios procesados
        const progress = Math.round((processedUsers / totalUsers) * 100);
        await redisClient.set(
          progressKey,
          JSON.stringify({ progress, status: 'processing' })
        );

        // Agregar el delay de 1 minuto (si lo deseas)
        await delay(1); // 1 minuto de retraso
      }

      // Marcar como completado en Redis
      await redisClient.set(
        progressKey,
        JSON.stringify({ progress: 100, status: 'completed' })
      );

      console.log('Datos generados:', allUsersData);
    } catch (error) {
      console.error('Error al procesar los usuarios:', error);
      await redisClient.set(
        progressKey,
        JSON.stringify({ progress: 0, status: 'error' })
      );
    } finally {
      console.timeEnd('Tiempo total de ejecución');
    }

    return allUsersData;
  }
}

module.exports = new UserService();
