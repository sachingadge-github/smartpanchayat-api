const router = require('express').Router();
const ctrl = require('./complaint.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { upload } = require('../upload/upload.service');
const v = require('./complaint.validation');

router.use(authenticate);
router.post('/', upload.single('photo'), validate(v.create), ctrl.create);
router.get('/mine', validate(v.list, 'query'), ctrl.listMine);
router.get('/:id', ctrl.getById);
router.get('/panchayat/:panchayatId', validate(v.list, 'query'), ctrl.listByPanchayat);
router.patch('/:id/status', validate(v.updateStatus), ctrl.updateStatus);

module.exports = router;
