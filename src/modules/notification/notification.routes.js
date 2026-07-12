const router = require('express').Router();
const ctrl = require('./notification.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);
router.post('/register', ctrl.registerToken);
router.delete('/unregister', ctrl.removeToken);

module.exports = router;
