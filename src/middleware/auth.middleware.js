const { verify } = require('../utils/jwt');
const R      = require('../utils/response');
const logger = require('../utils/logger')('auth.middleware');

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    logger.warn('Missing or malformed Authorization header', { method: req.method, path: req.path });
    return R.unauthorized(res, 'Access token required');
  }
  try {
    req.user = verify(header.split(' ')[1]);
    logger.debug('Token verified', { userId: req.user.id, role: req.user.role, path: req.path });
    next();
  } catch (err) {
    logger.warn('Token verification failed', { method: req.method, path: req.path, error: err.message });
    return R.unauthorized(res, 'Invalid or expired token');
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    logger.warn('Insufficient permissions', { userId: req.user?.id, role: req.user?.role, required: roles, path: req.path });
    return R.forbidden(res, 'Insufficient permissions');
  }
  next();
};

module.exports = { authenticate, authorize };
