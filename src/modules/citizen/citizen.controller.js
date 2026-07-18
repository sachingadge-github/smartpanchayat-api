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

const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) return R.badRequest(res, 'Photo file is required', 'VALIDATION_ERROR');
    const host = `${req.protocol}://${req.get('host')}`;
    const photoUrl = `${host}/uploads/${req.file.filename}`;
    const data = await service.updatePhoto(req.user.id, photoUrl);
    return R.success(res, 'Profile photo updated', { photo_url: data.photo_url });
  } catch (e) { next(e); }
};

module.exports = { getProfile, updateProfile, uploadPhoto };
