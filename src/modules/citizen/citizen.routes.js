const router = require('express').Router();
const ctrl = require('./citizen.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const v = require('./citizen.validation');

router.use(authenticate);
router.get('/profile', ctrl.getProfile);
router.put('/profile', validate(v.updateProfile), ctrl.updateProfile);

module.exports = router;
