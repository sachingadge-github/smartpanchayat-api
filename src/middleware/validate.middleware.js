const R = require('../utils/response');

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map(d => ({ field: d.path.join('.'), message: d.message }));
    return R.badRequest(res, 'Validation failed', 'VALIDATION_ERROR', details);
  }
  req[source] = value;
  next();
};

module.exports = { validate };
