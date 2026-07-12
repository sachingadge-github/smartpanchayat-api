const service = require('./certificate.service');
const R = require('../../utils/response');

const apply = async (req, res, next) => {
  try {
    const data = await service.apply(req.user.id, req.body);
    return R.created(res, 'Certificate application submitted', data);
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const data = await service.getById(req.params.id);
    return R.success(res, 'Certificate fetched', data);
  } catch (e) { next(e); }
};

const listMine = async (req, res, next) => {
  try {
    const { rows, total, page, limit, pages } = await service.listMine(req.user.id, req.query);
    return R.paginated(res, 'Certificates fetched', rows, { total, page, limit, pages });
  } catch (e) { next(e); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, remark, pdf_url } = req.body;
    const data = await service.updateStatus(req.params.id, status, remark, pdf_url);
    return R.success(res, 'Certificate status updated', data);
  } catch (e) { next(e); }
};

module.exports = { apply, getById, listMine, updateStatus };
