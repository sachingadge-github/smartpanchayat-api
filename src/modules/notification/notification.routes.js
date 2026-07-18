const router = require('express').Router();
const ctrl = require('./notification.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);
router.get('/',                   ctrl.list);
router.get('/unread-count',       ctrl.getUnreadCount);
router.post('/read-all',          ctrl.markAllRead);
router.patch('/:id/read',         ctrl.markRead);
router.post('/register',          ctrl.registerToken);
router.delete('/unregister',      ctrl.removeToken);
router.post('/send/user',         ctrl.sendToUser);
router.post('/send/panchayat',    ctrl.sendToPanchayat);

module.exports = router;
