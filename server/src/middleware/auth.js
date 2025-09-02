const tokenService = require('../services/tokenService');
const authService = require('../services/authService');
const logger = require('../utils/logger');

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

const authMiddleware = async (req, res, next) => {
  try {
    const accessToken = extractToken(req);

    if (!accessToken) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token not provided'
      });
    }

    const decoded = tokenService.verifyAccessToken(accessToken);
    const user = await authService.findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found'
      });
    }

    req.user = authService.getUserPublicData(user);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Access token has expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Access token is invalid'
      });
    }

    logger.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const accessToken = extractToken(req);

    if (accessToken) {
      const decoded = tokenService.verifyAccessToken(accessToken);
      const user = await authService.findUserById(decoded.userId);
      if (user) {
        req.user = authService.getUserPublicData(user);
      }
    }

    next();
  } catch (error) {
    // optional: не выбрасываем ошибку, идём дальше без пользователя
    next();
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    const hasRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  optionalAuth,
  requireRole
};
