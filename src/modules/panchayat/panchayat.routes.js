const router = require('express').Router();
const ctrl = require('./panchayat.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/:id/stats', authenticate, ctrl.getStats);

module.exports = router;
