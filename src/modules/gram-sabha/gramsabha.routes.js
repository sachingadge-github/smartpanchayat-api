const router = require('express').Router();
const ctrl = require('./gramsabha.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.get('/meetings',          ctrl.listMeetings);
router.post('/attendance',       authenticate, ctrl.submitAttendance);
router.get('/polls',             authenticate, ctrl.listPolls);
router.post('/polls/:id/vote',   authenticate, ctrl.submitVote);

module.exports = router;
