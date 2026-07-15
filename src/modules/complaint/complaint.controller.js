const service = require('./complaint.service');
const R = require('../../utils/response');

const create = async (req, res, next) => {
  try {
    const photoUrl = req.body.photo_url || null;
    const data = await service.create(req.user.id, req.body, photoUrl);
    return R.created(res, 'Complaint filed successfully', data);
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const data = await service.getById(req.params.id);
    return R.success(res, 'Complaint fetched', data);
  } catch (e) { next(e); }
};

const listMine = async (req, res, next) => {
  try {
    const { rows, total, page, limit, pages } = await service.listMine(req.user.id, req.query);
    return R.paginated(res, 'Complaints fetched', rows, { total, page, limit, pages });
  } catch (e) { next(e); }
};

const listByPanchayat = async (req, res, next) => {
  try {
    const { rows, total, page, limit, pages } = await service.listByPanchayat(req.params.panchayatId, req.query);
    return R.paginated(res, 'Complaints fetched', rows, { total, page, limit, pages });
  } catch (e) { next(e); }
};

const updateStatus = async (req, res, next) => {
  try {
    const data = await service.updateStatus(req.params.id, req.body.status, req.body.remark);
    return R.success(res, 'Status updated', data);
  } catch (e) { next(e); }
};

module.exports = { create, getById, listMine, listByPanchayat, updateStatus };
