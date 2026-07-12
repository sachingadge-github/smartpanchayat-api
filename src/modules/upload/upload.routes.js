const router = require('express').Router();
const { upload } = require('./upload.service');
const ctrl = require('./upload.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/', authenticate, upload.single('file'), ctrl.uploadFile);

module.exports = router;
