const router = require('express').Router();
const controller = require('../controllers/storeController');
const { ratingRules } = require('../validators/ratingValidators');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('USER'));

router.get('/', controller.listStores);
router.put('/:id/rating', ratingRules, controller.submitRating);

module.exports = router;