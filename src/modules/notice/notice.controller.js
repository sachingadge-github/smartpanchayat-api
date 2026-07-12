const service = require('./notice.service');
const R = require('../../utils/response');

const create = async (req, res, next) => {
  try {
    const data = await service.create({ ...req.body, created_by: req.user.id });
    return R.created(res, 'Notice published', data);
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const data = await service.getById(req.params.id);
    return R.success(res, 'Notice fetched', data);
  } catch (e) { next(e); }
};

const list = async (req, res, next) => {
  try {
    const { rows, total, page, limit, pages } = await service.list(req.query);
    return R.paginated(res, 'Notices fetched', rows, { total, page, limit, pages });
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    return R.success(res, 'Notice deleted');
  } catch (e) { next(e); }
};

module.exports = { create, getById, list, remove };
