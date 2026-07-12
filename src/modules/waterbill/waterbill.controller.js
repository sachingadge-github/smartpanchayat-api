const service = require('./waterbill.service');
const R = require('../../utils/response');

const getDues = async (req, res, next) => {
  try {
    const data = await service.getDues(req.user.id);
    return R.success(res, 'Water bills fetched', data);
  } catch (e) { next(e); }
};

const initPayment = async (req, res, next) => {
  try {
    const data = await service.initPayment(req.params.id, req.user.id);
    return R.success(res, 'Payment initiated', data);
  } catch (e) { next(e); }
};

const confirmPayment = async (req, res, next) => {
  try {
    const data = await service.confirmPayment(req.params.id, req.user.id, req.body.payment_ref);
    return R.success(res, 'Payment confirmed', data);
  } catch (e) { next(e); }
};

module.exports = { getDues, initPayment, confirmPayment };
