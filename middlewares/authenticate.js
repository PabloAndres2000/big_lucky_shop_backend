const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'test';

exports.decodeToken = function (req, res, next) {
  // Verificar si el header "Authorization" existe
  if (!req.headers.authorization) {
    return res.status(403).json({ message: 'No headers provided' });
  }

  // Extraer el token del header
  const token = req.headers.authorization.trim();

  // Validar que el token tiene el formato correcto (tres segmentos separados por puntos)
  const segments = token.split('.');
  if (segments.length !== 3) {
    return res.status(400).json({ message: 'Invalid token format' });
  }

  let payload;
  try {
    // Decodificar el token usando la clave secreta
    payload = jwt.decode(token, secret);

    // Verificar si el token ha expirado
    if (payload.exp && moment().unix() > payload.exp) {
      return res.status(401).json({ message: 'Token has expired' });
    }
  } catch (error) {
    // Manejar errores durante la decodificación
    return res
      .status(403)
      .json({ message: 'Invalid token', error: error.message });
  }

  // Adjuntar la información del usuario decodificada al objeto de solicitud
  req.user = payload;

  // Continuar al siguiente middleware
  next();
};
