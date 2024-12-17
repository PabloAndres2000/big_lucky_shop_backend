const TokenService = require('../helpers/jwt');
const { User } = require('../models/User/userModel');
const bcrypt = require('bcrypt-nodejs');
const { NotFoundError } = require('../middlewares/errors');

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
}

module.exports = new UserService();
