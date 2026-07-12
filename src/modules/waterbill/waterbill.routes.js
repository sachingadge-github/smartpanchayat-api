const router = require('express').Router();
const ctrl = require('./waterbill.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);
router.get('/dues', ctrl.getDues);
router.post('/:id/pay/init', ctrl.initPayment);
router.post('/:id/pay/confirm', ctrl.confirmPayment);

module.exports = router;
