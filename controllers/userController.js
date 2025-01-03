const express = require('express');
const userService = require('../services/userService');

class UserController {
  async createUserAdmin(req, res, next) {
    try {
      const userData = req.body;
      const newUser = await userService.createUserAdmin(userData);

      const { password, ...userWithoutPassword } = newUser.toObject();
      return res.status(201).json({
        message: 'Usuario administrador creado con éxito',
        data: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }

  async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email y contraseña son obligatorios',
        });
      }

      const { token, user } = await userService.loginUser(email, password);

      return res.status(200).json({
        message: 'Bienvenido!',
        token,
        user: {
          id: user._id,
          name: user.name,
          last_name: user.last_name,
          email: user.email,
          rol: user.rol,
        },
      });
    } catch (error) {
      console.error('Error en loginUser:', error);
      next(error);
    }
  }

  async getAllUsersAdmin(req, res, next) {
    if (req.user) {
      try {
        const users = await userService.getAllUsersAdmin();
        return res.status(200).json(users);
      } catch (error) {
        next(error);
      }
    } else {
      res.status(500).send({ data: undefined, message: 'ErrorToken' });
    }
  }
}

module.exports = new UserController();
