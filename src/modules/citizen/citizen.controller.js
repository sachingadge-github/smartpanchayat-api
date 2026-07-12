const service = require('./citizen.service');
const R = require('../../utils/response');

const getProfile = async (req, res, next) => {
  try {
    const data = await service.getProfile(req.user.id);
    return R.success(res, 'Profile fetched', data);
  } catch (e) { next(e); }
};

const updateProfile = async (req, res, next) => {
  try {
    const data = await service.updateProfile(req.user.id, req.body);
    return R.success(res, 'Profile updated', data);
  } catch (e) { next(e); }
};

module.exports = { getProfile, updateProfile };
