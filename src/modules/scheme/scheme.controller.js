const service = require('./scheme.service');
const R = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const { rows, total, page, limit, pages } = await service.list(req.query);
    return R.paginated(res, 'Schemes fetched', rows, { total, page, limit, pages });
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const data = await service.getById(req.params.id);
    return R.success(res, 'Scheme fetched', data);
  } catch (e) { next(e); }
};

module.exports = { list, getById };
