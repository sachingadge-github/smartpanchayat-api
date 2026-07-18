const service      = require('./complaint.service');
const notifService = require('../notification/notification.service');
const R            = require('../../utils/response');

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

const STATUS_MESSAGES = {
  in_progress: 'Your complaint is being worked on',
  resolved:    'Your complaint has been resolved',
  rejected:    'Your complaint was reviewed and rejected',
};

const updateStatus = async (req, res, next) => {
  try {
    const data = await service.updateStatus(req.params.id, req.body.status, req.body.remark);

    const msg = STATUS_MESSAGES[req.body.status];
    if (msg && data.citizen_id) {
      notifService.sendToUser(data.citizen_id, 'Complaint Update', msg, {
        complaint_id: String(data.id),
        status:       req.body.status,
        reference_no: data.reference_no || '',
      }).catch(() => {});
    }

    return R.success(res, 'Status updated', data);
  } catch (e) { next(e); }
};

const getCategories = async (req, res, next) => {
  try {
    return R.success(res, 'Complaint categories fetched', service.getCategories());
  } catch (e) { next(e); }
};

const getByIdFull = async (req, res, next) => {
  try {
    const data = await service.getByIdFull(req.params.id);
    return R.success(res, 'Complaint fetched', data);
  } catch (e) { next(e); }
};

const rateComplaint = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return R.badRequest(res, 'rating must be between 1 and 5');
    const data = await service.rateComplaint(req.params.id, req.user.id, rating, comment);
    return R.success(res, 'Rating submitted', data);
  } catch (e) { next(e); }
};

module.exports = { create, getById: getByIdFull, listMine, listByPanchayat, updateStatus, getCategories, rateComplaint };
