const { NotFoundError } = require('./errors'); // Ajusta la ruta según corresponda

function errorHandler(err, req, res, next) {
  // Si el error es de tipo NotFoundError
  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      error: 'Not Found',
      message: err.message,
    });
  }

  // Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 400,
      error: 'Validation Error',
      message: err.message,
      details: err.errors, // Detalles específicos de Mongoose
    });
  }

  // Error de clave duplicada en MongoDB
  if (err.code === 11000) {
    const duplicatedField = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      status: 400,
      error: 'Duplicate Key Error',
      message: `El campo ${duplicatedField} ya existe.`,
    });
  }

  // Otros errores controlados
  if (err instanceof Error) {
    return res.status(400).json({
      status: 400,
      error: err.name,
      message: err.message,
    });
  }

  // Error genérico
  return res.status(500).json({
    status: 500,
    error: 'Internal Server Error',
    message: err.message || 'Algo salió mal.',
  });
}

module.exports = errorHandler;
