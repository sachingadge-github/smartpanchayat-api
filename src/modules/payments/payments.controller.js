const service = require('./payments.service');
const R = require('../../utils/response');

const getConfig = async (req, res, next) => {
  try {
    const { panchayat_id } = req.query;
    if (!panchayat_id) return R.badRequest(res, 'panchayat_id is required', 'VALIDATION_ERROR');
    const data = await service.getConfig(panchayat_id);
    return R.success(res, 'Payment config fetched', data);
  } catch (e) { next(e); }
};

const getReceipt = async (req, res, next) => {
  try {
    const data = await service.getReceipt(req.params.receipt_no, req.user.id);
    return R.success(res, 'Receipt fetched', data);
  } catch (e) { next(e); }
};

const getPropertyTaxDues = async (req, res, next) => {
  try {
    const data = await service.getPropertyTaxDues(req.user.id);
    return R.success(res, 'Property tax dues fetched', data);
  } catch (e) { next(e); }
};

const getHistory = async (req, res, next) => {
  try {
    const data = await service.getPaymentHistory(req.user.id);
    return R.success(res, 'Payment history fetched', data);
  } catch (e) { next(e); }
};

module.exports = { getConfig, getReceipt, getPropertyTaxDues, getHistory };
