const router = require('express').Router();
const ctrl = require('./panchayat.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// Public
router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getById);

// Auth required
router.get('/:id/stats',          authenticate, ctrl.getStats);
router.get('/:id/profile',        ctrl.getProfile);
router.get('/:id/quick-services', ctrl.getQuickServices);

// Officer / Admin only — manage profile & staff
router.put('/:id/profile',                    authenticate, authorize('officer', 'admin'), ctrl.upsertProfile);
router.post('/:id/staff',                     authenticate, authorize('officer', 'admin'), ctrl.addStaff);
router.put('/:id/staff/:staff_id',            authenticate, authorize('officer', 'admin'), ctrl.updateStaff);
router.delete('/:id/staff/:staff_id',         authenticate, authorize('officer', 'admin'), ctrl.deleteStaff);

module.exports = router;
