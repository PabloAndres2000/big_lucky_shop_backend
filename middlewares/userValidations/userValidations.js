const { check, validationResult } = require('express-validator');

const validateUserAdmin = [
  check('name').notEmpty().withMessage('El nombre es obligatorio.'),
  check('email').isEmail().withMessage('El correo no es válido.'),
  check('password')
    .isLength({ min: 3 })
    .withMessage('La contraseña debe tener al menos 3 caracteres.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next({ errors: errors.array(), name: 'ValidationError' });
    }
    next();
  },
];

module.exports = validateUserAdmin;
