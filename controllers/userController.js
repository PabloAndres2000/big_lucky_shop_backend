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
        const { filter = '' } = req.query;
        const users = await userService.getAllUsersAdmin(filter);
        return res.status(200).json(users);
      } catch (error) {
        next(error);
      }
    } else {
      res.status(500).send({ data: undefined, message: 'ErrorToken' });
    }
  }

  async getUserById(req, res, next) {
    if (req.user) {
      try {
        const { id } = req.params;
        if (!id) {
          return res.status(400).json({ message: 'ID no proporcionado' });
        }
        const user = await userService.getUserById(id);
        if (!user) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        return res.status(200).json(user);
      } catch (error) {
        next(error);
      }
    } else {
      res.status(401).json({ message: 'Token inválido o no proporcionado' });
    }
  }

  async updateUserById(req, res, next) {
    if (req.user) {
      try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
          return res.status(400).json({ message: 'ID no proporcionado' });
        }

        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({ message: 'Datos no proporcionados' });
        }

        const updateUser = await userService.updateUserById(id, updateData);

        return res.status(200).json({
          message: 'Usuario actualizado con exito',
          data: updateUser,
        });
      } catch (error) {
        next(error);
      }
    } else {
      res.status(401).json({ message: 'Token inválido o no proporcionado' });
    }
  }
}

module.exports = new UserController();
