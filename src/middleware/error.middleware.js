const R = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  if (err.code === 'ER_DUP_ENTRY') {
    return R.badRequest(res, 'Duplicate entry — record already exists', 'DUPLICATE_ENTRY');
  }
  return R.error(res, err.message || 'Internal server error', err.statusCode || 500);
};

const notFound = (req, res) => R.notFound(res, `Route ${req.method} ${req.path} not found`);

module.exports = { errorHandler, notFound };
