const express = require('express');
const userController = require('../controllers/userController');
const validateCreateUserAdmin = require('../middlewares/userValidations/userValidations');
const authenticate = require('../middlewares/authenticate');
const router = express.Router();

// Rutas específicas para usuarios
router.post(
  '/users/create-user-admin',
  authenticate.decodeToken,
  validateCreateUserAdmin,
  userController.createUserAdmin
);
router.post('/users/login', userController.loginUser); // Ruta: /api/users/login

module.exports = router;
