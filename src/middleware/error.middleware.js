const R      = require('../utils/response');
const logger = require('../utils/logger')('error.middleware');

const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const meta = {
    method:  req.method,
    path:    req.path,
    query:   req.query,
    body:    req.body,
    user:    req.user ? { id: req.user.id, role: req.user.role } : null,
    code:    err.code  || null,
    sql:     err.sql   || null,
    sqlMsg:  err.sqlMessage || null,
    stack:   status >= 500 ? err.stack : undefined,
  };

  if (status >= 500) {
    logger.error(`${req.method} ${req.path} — ${err.message}`, meta);
  } else {
    logger.warn(`${req.method} ${req.path} — ${err.message}`, { method: meta.method, path: meta.path, code: meta.code });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return R.badRequest(res, 'Duplicate entry — record already exists', 'DUPLICATE_ENTRY');
  }
  return R.error(res, err.message || 'Internal server error', status);
};

const notFound = (req, res) => {
  logger.warn(`404 — ${req.method} ${req.path}`);
  R.notFound(res, `Route ${req.method} ${req.path} not found`);
};

module.exports = { errorHandler, notFound };
