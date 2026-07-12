const { verify } = require('../utils/jwt');
const R = require('../utils/response');

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return R.unauthorized(res, 'Access token required');
  }
  try {
    req.user = verify(header.split(' ')[1]);
    next();
  } catch {
    return R.unauthorized(res, 'Invalid or expired token');
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return R.forbidden(res, 'Insufficient permissions');
  }
  next();
};

module.exports = { authenticate, authorize };
