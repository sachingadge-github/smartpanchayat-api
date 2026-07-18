const router = require('express').Router();
const ctrl = require('./ai.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/chat', authenticate, ctrl.chat);

module.exports = router;
