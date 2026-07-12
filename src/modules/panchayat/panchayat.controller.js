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

module.exports = { getAll, getById, getStats };
