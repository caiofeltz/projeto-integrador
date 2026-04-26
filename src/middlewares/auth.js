const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const { logSecurityEvent } = require('../utils/auditLogger');

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      logSecurityEvent('auth_missing_token', { path: req.path, method: req.method });
      return res.status(401).json({ error: 'Token não enviado.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (_error) {
    logSecurityEvent('auth_invalid_token', { path: req.path, method: req.method });
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.tipo)) {
      logSecurityEvent('auth_forbidden_role', {
        path: req.path,
        method: req.method,
        user_id: req.user?.id,
        user_role: req.user?.tipo,
        required_roles: roles,
      });
      return res.status(403).json({ error: 'Acesso negado para este perfil.' });
    }
    return next();
  };
}

module.exports = {
  authMiddleware,
  allowRoles,
};
