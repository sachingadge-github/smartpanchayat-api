const router = require('express').Router();
const ctrl = require('./notice.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', authenticate, ctrl.create);
router.delete('/:id', authenticate, ctrl.remove);

module.exports = router;
