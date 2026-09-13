// Authentication Middleware for LIFE RPG
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'liferpg_secret_jwt_key_super_secure_game_vault_2025';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token is missing or invalid. Please authenticate.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Session token has expired or is invalid. Please log in again.'
      });
    }

    req.user = user;
    next();
  });
}

export function generateToken(userPayload) {
  return jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
}
