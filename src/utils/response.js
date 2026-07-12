const env = require('../config/env');

const meta = () => ({
  timestamp: new Date().toISOString(),
  version: env.app.version,
});

const success = (res, message = 'Success', data = null, statusCode = 200, extra = {}) => {
  const payload = { success: true, message, meta: meta() };
  if (data !== null) payload.data = data;
  Object.assign(payload, extra);
  return res.status(statusCode).json(payload);
};

const created = (res, message = 'Created successfully', data = null) =>
  success(res, message, data, 201);

const error = (res, message = 'Something went wrong', statusCode = 500, code = null, details = null) => {
  const payload = { success: false, message, meta: meta() };
  if (code) payload.error = { code };
  if (details) payload.error = { ...(payload.error || {}), details };
  return res.status(statusCode).json(payload);
};

const badRequest = (res, message = 'Bad request', code = 'BAD_REQUEST', details = null) =>
  error(res, message, 400, code, details);

const unauthorized = (res, message = 'Unauthorized') =>
  error(res, message, 401, 'UNAUTHORIZED');

const forbidden = (res, message = 'Forbidden') =>
  error(res, message, 403, 'FORBIDDEN');

const notFound = (res, message = 'Resource not found') =>
  error(res, message, 404, 'NOT_FOUND');

const paginated = (res, message = 'Success', data = [], pagination = {}) =>
  success(res, message, data, 200, { pagination });

module.exports = { success, created, error, badRequest, unauthorized, forbidden, notFound, paginated };
