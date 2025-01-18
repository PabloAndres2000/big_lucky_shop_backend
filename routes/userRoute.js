const express = require('express');
const userController = require('../controllers/userController');
const validateCreateUserAdmin = require('../middlewares/userValidations/userValidations');
const authenticate = require('../middlewares/authenticate');
const router = express.Router();

// Rutas específicas para usuarios
router.post(
  '/users/create-user-admin',
  // authenticate.decodeToken,
  validateCreateUserAdmin,
  userController.createUserAdmin
);
router.post('/users/login', userController.loginUser); // Ruta: /api/users/login

router.post(
  '/users/export_users',
  authenticate.decodeToken, // Verifica autenticación
  userController.startExportUsers
);
// GET
router.get(
  '/users/get_all_users_admin',
  authenticate.decodeToken,
  userController.getAllUsersAdmin
);

router.get(
  '/users/get_user_by_id/:id',
  authenticate.decodeToken,
  userController.getUserById
);
router.get(
  '/users/export_progress',
  authenticate.decodeToken, // Verifica autenticación
  userController.getExportProgress
);

// router.get(
//   '/users/export_users',
//   authenticate.decodeToken, // Asegura que solo usuarios autenticados puedan exportar
//   userController.exportAllUsersByExcel
// );

// PUT
router.put(
  '/users/update_user_by_id/:id',
  authenticate.decodeToken,
  userController.updateUserById
);
module.exports = router;
