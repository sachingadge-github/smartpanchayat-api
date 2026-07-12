const service = require('./notification.service');
const R = require('../../utils/response');

const registerToken = async (req, res, next) => {
  try {
    await service.registerToken(req.user.id, req.body.token, req.body.platform);
    return R.success(res, 'Device token registered');
  } catch (e) { next(e); }
};

const removeToken = async (req, res, next) => {
  try {
    await service.removeToken(req.user.id, req.body.token);
    return R.success(res, 'Device token removed');
  } catch (e) { next(e); }
};

module.exports = { registerToken, removeToken };
