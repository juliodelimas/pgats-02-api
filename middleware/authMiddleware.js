const { validateToken } = require('../service/userService');

/**
 * Middleware para validar autenticação JWT
 * Verifica se o token Bearer está presente e é válido
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acesso requerido. Use: Authorization: Bearer {token}' 
    });
  }

  try {
    const decoded = validateToken(token);
    req.user = decoded; // Adiciona informações do usuário decodificadas do token
    next();
  } catch (err) {
    return res.status(403).json({ 
      error: 'Token inválido ou expirado' 
    });
  }
}

module.exports = { authenticateToken };
