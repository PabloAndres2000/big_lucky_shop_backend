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
}

module.exports = new UserService();
