const router = require('express').Router();
const ctrl = require('./auth.controller');
const { validate } = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const v = require('./auth.validation');

router.post('/register',   validate(v.register),   ctrl.register);
router.post('/send-otp',   validate(v.sendOtp),    ctrl.sendOtp);
router.post('/verify-otp', validate(v.verifyOtp),  ctrl.verifyOtp);
router.post('/refresh',    validate(v.refresh),     ctrl.refreshToken);
router.post('/logout',     authenticate,            ctrl.logout);

module.exports = router;
