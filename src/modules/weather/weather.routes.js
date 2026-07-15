const router = require('express').Router();
const ctrl   = require('./weather.controller');

router.get('/current', ctrl.getCurrent);

module.exports = router;
