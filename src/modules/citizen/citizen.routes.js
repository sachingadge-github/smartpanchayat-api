const router = require('express').Router();
const ctrl = require('./citizen.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { upload } = require('../upload/upload.service');
const v = require('./citizen.validation');

router.use(authenticate);
router.get('/profile',        ctrl.getProfile);
router.put('/profile',        validate(v.updateProfile), ctrl.updateProfile);
router.post('/profile/photo', upload.single('photo'), ctrl.uploadPhoto);

module.exports = router;
