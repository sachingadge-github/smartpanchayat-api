const router = require('express').Router();
const ctrl = require('./citizenservices.controller');

router.get('/',    ctrl.list);
router.get('/:id', ctrl.getById);

module.exports = router;
