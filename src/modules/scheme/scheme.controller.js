const service = require('./scheme.service');
const R = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const citizenId = req.user?.id || null;
    const { rows, total, page, limit, pages } = await service.listWithBookmarks(req.query, citizenId);
    return R.paginated(res, 'Schemes fetched', rows, { total, page, limit, pages });
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const data = await service.getById(req.params.id);
    return R.success(res, 'Scheme fetched', data);
  } catch (e) { next(e); }
};

const bookmark = async (req, res, next) => {
  try {
    const data = await service.toggleBookmark(req.params.id, req.user.id, true);
    return R.success(res, 'Scheme bookmarked', data);
  } catch (e) { next(e); }
};

const unbookmark = async (req, res, next) => {
  try {
    const data = await service.toggleBookmark(req.params.id, req.user.id, false);
    return R.success(res, 'Scheme bookmark removed', data);
  } catch (e) { next(e); }
};

module.exports = { list, getById, bookmark, unbookmark };
