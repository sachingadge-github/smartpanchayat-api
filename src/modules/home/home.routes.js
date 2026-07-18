const router = require('express').Router();
const ctrl = require('./home.controller');

router.get('/quick-services', ctrl.quickServices);
router.get('/emergency-contacts', ctrl.emergencyContacts);
router.get('/app-config', ctrl.appConfig);

module.exports = router;
