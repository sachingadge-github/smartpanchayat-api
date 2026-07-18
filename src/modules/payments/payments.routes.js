const router = require('express').Router();
const ctrl = require('./payments.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);
router.get('/config',                    ctrl.getConfig);
router.get('/history',                   ctrl.getHistory);
router.get('/property-tax/dues',         ctrl.getPropertyTaxDues);
router.get('/:receipt_no/receipt',       ctrl.getReceipt);

module.exports = router;
