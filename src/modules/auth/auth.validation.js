const Joi = require('joi');

const mobile = Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
  'string.pattern.base': 'Enter a valid 10-digit Indian mobile number',
});

const sendOtp = Joi.object({ mobile });
const verifyOtp = Joi.object({ mobile, otp: Joi.string().length(6).required() });
const refresh = Joi.object({ refreshToken: Joi.string().required() });

module.exports = { sendOtp, verifyOtp, refresh };
