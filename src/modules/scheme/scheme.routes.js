const router = require('express').Router();
const ctrl = require('./scheme.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.get('/',    ctrl.list);
router.get('/:id', ctrl.getById);

router.post('/:id/bookmark',   authenticate, ctrl.bookmark);
router.delete('/:id/bookmark', authenticate, ctrl.unbookmark);

module.exports = router;
