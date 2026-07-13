const Joi = require('joi');

const mobile = Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
  'string.pattern.base': 'Enter a valid 10-digit Indian mobile number',
});

const sendOtp = Joi.object({ mobile });
const verifyOtp = Joi.object({ mobile, otp: Joi.string().length(6).required() });
const refresh = Joi.object({ refreshToken: Joi.string().required() });

const register = Joi.object({
  name:         Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  mobile,
  panchayat_id: Joi.number().integer().positive().required().messages({
    'any.required': 'Panchayat ID is required',
    'number.base':  'Panchayat ID must be a number',
  }),
});

module.exports = { sendOtp, verifyOtp, refresh, register };
