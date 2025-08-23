const { validateToken, findUserByUsername } = require('../service/userService');

/**
 * Middleware para validar autenticação JWT
 * Verifica se o token Bearer está presente, é válido E se o usuário existe
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
    // 1. Validar se o JWT é válido (assinatura, expiração)
    const decoded = validateToken(token);
    
    // 2. Verificar se o usuário ainda existe no sistema
    const user = findUserByUsername(decoded.username);
    if (!user) {
      return res.status(401).json({ 
        error: 'Usuário não encontrado ou foi removido do sistema' 
      });
    }
    
    // 3. Adicionar informações do usuário real (não só do token)
    req.user = {
      username: user.username,
      saldo: user.saldo,
      favorecidos: user.favorecidos
    };
    
    next();
  } catch (err) {
    return res.status(403).json({ 
      error: 'Token inválido ou expirado' 
    });
  }
}

module.exports = { authenticateToken };
