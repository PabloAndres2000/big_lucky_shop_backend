const jwt = require('jwt-simple');
const moment = require('moment');
const secretKey = 'test'; // Cambia esto por una clave secreta segura

class TokenService {
  static createAccessToken(user) {
    const payload = {
      sub: user._id,
      name: user.name,
      last_name: user.last_name,
      email: user.email,
      rol: user.rol,
      iat: moment().unix(), // Fecha de creación del token (timestamp)
      exp: moment().add(1, 'day').unix(),
    };
    return jwt.encode(payload, secretKey);
  }
}

module.exports = TokenService;
