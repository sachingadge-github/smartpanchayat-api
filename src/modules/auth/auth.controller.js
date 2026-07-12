const service = require('./auth.service');
const R = require('../../utils/response');

const sendOtp = async (req, res, next) => {
  try {
    const data = await service.sendOtp(req.body.mobile);
    const msg = data.mock
      ? `[MOCK] OTP for ${req.body.mobile} is ${data.otp}`
      : `OTP sent to ${req.body.mobile}`;
    return R.success(res, msg, data.mock ? { otp: data.otp } : null);
  } catch (e) { next(e); }
};

const verifyOtp = async (req, res, next) => {
  try {
    const result = await service.verifyOtp(req.body.mobile, req.body.otp);
    return R.success(res, result.isNew ? 'Registration successful' : 'Login successful', {
      isNew: result.isNew,
      citizen: result.citizen,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (e) { next(e); }
};

const refreshToken = async (req, res, next) => {
  try {
    const result = await service.refreshToken(req.body.refreshToken);
    return R.success(res, 'Token refreshed', result);
  } catch (e) { next(e); }
};

const logout = (req, res) => R.success(res, 'Logged out successfully');

module.exports = { sendOtp, verifyOtp, refreshToken, logout };
