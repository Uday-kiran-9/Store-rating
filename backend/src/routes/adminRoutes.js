const router = require('express').Router();
const controller = require('../controllers/adminController');
const validators = require('../validators/adminValidators');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('ADMIN'));

router.get('/stats', controller.getStats);

router.post('/users', validators.createUserRules, controller.createUser);
router.get('/users', controller.listUsers);
router.get('/users/:id', controller.getUser);

router.post('/stores', validators.createStoreRules, controller.createStore);
router.get('/stores', controller.listStores);

module.exports = router;