const express = require('express');
const userService = require('../services/userService');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const client = require('../settings/redisClient');

class UserController {
  constructor() {
    this.exportProgress = {};
    this.startExportUsers = this.startExportUsers.bind(this);
  }

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

  async exportAllUsersByExcel(req, res, next) {
    try {
      const data = await userService.exportAllUsersByExcel();

      if (!data || data.length === 0) {
        return res
          .status(404)
          .json({ error: 'No hay usuarios para exportar.' });
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Colaboradores');
      const excelBuffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      });

      // Configura los encabezados de la respuesta
      res.setHeader('Content-Disposition', 'attachment; filename=este.xlsx');
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      // Envía el archivo al cliente
      res.send(excelBuffer);
    } catch (error) {
      console.error('Error en exportUsersToExcel:', error.message);
      res.status(500).json({ error: 'Error al exportar usuarios a Excel.' });
      next(error);
    }
  }

  async startExportUsers(req, res) {
    const progressKey = 'export_progress';

    try {
      if (!client.isOpen) {
        console.log('Reintentando conectar a Redis...');
        await connectRedis();
      }

      // Inicializar el progreso en Redis
      await client.set(
        progressKey,
        JSON.stringify({ progress: 0, status: 'pending' })
      );

      // Llamada al servicio para exportar usuarios
      const data = await userService.exportAllUsersByExcel(client, progressKey);

      // Generación del archivo Excel
      const excelBuffer = this.generateExcelFile(data);
      console.log('Buffer generado', excelBuffer.length);

      // Marcar el progreso como completado en Redis
      await client.set(
        progressKey,
        JSON.stringify({
          progress: 100,
          status: 'completed',
          fileAvailable: true,
        })
      );

      // Enviar el archivo Excel al cliente
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=exported_users.xlsx'
      );
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.end(excelBuffer);
    } catch (err) {
      console.error('Error en exportUsersToExcel:', err);

      await client.set(
        progressKey,
        JSON.stringify({ progress: 0, status: 'error' })
      );

      if (!res.headersSent) {
        res.status(500).json({ error: 'Error en la exportación' });
      }
    }
  }

  async getExportProgress(req, res) {
    const progressKey = 'export_progress';

    try {
      const progressData = await client.get(progressKey);

      if (progressData) {
        res.status(200).json(JSON.parse(progressData));
      } else {
        res.status(404).json({ message: 'No hay exportación en curso.' });
      }
    } catch (err) {
      console.error('Error al obtener el progreso:', err);
      res.status(500).json({ error: 'Error al obtener el progreso' });
    }
  }

  generateExcelFile(data) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Colaboradores');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}

module.exports = new UserController();
