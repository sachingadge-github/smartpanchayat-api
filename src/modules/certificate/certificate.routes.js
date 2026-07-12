const router = require('express').Router();
const ctrl = require('./certificate.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const v = require('./certificate.validation');

router.use(authenticate);
router.post('/', validate(v.apply), ctrl.apply);
router.get('/mine', validate(v.list, 'query'), ctrl.listMine);
router.get('/:id', ctrl.getById);
router.patch('/:id/status', validate(v.updateStatus), ctrl.updateStatus);

module.exports = router;
