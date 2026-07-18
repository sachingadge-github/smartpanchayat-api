const service = require('./panchayat.service');
const R = require('../../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { rows, total, page, limit, pages } = await service.getAll(req.query);
    return R.paginated(res, 'Panchayats fetched', rows, { total, page, limit, pages });
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const data = await service.getById(req.params.id);
    return R.success(res, 'Panchayat fetched', data);
  } catch (e) { next(e); }
};

const getStats = async (req, res, next) => {
  try {
    const data = await service.getStats(req.params.id);
    return R.success(res, 'Stats fetched', data);
  } catch (e) { next(e); }
};

const getProfile = async (req, res, next) => {
  try {
    const data = await service.getProfile(req.params.id);
    return R.success(res, 'Panchayat profile fetched', data);
  } catch (e) { next(e); }
};

const upsertProfile = async (req, res, next) => {
  try {
    const data = await service.upsertProfile(req.params.id, req.body);
    return R.success(res, 'Panchayat profile updated', data);
  } catch (e) { next(e); }
};

const addStaff = async (req, res, next) => {
  try {
    const data = await service.addStaff(req.params.id, req.body);
    return R.created(res, 'Staff member added', data);
  } catch (e) { next(e); }
};

const updateStaff = async (req, res, next) => {
  try {
    const data = await service.updateStaff(req.params.id, req.params.staff_id, req.body);
    return R.success(res, 'Staff member updated', data);
  } catch (e) { next(e); }
};

const deleteStaff = async (req, res, next) => {
  try {
    await service.deleteStaff(req.params.id, req.params.staff_id);
    return R.success(res, 'Staff member removed');
  } catch (e) { next(e); }
};

const getQuickServices = async (req, res, next) => {
  try {
    const data = await service.getQuickServices(req.params.id);
    return R.success(res, 'Quick services fetched', data);
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, getStats, getProfile, upsertProfile, addStaff, updateStaff, deleteStaff, getQuickServices };
