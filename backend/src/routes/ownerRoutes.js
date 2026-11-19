const router = require('express').Router();
const controller = require('../controllers/ownerController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('STORE_OWNER'));

router.get('/dashboard', controller.dashboard);

module.exports = router;