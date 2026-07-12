const Joi = require('joi');

const updateProfile = Joi.object({
  name: Joi.string().min(2).max(100),
  gender: Joi.string().valid('male', 'female', 'other'),
  age: Joi.number().integer().min(1).max(120),
  address: Joi.string().max(300),
  panchayat_id: Joi.number().integer().positive(),
});

module.exports = { updateProfile };
