const router = require('express').Router();
const controller = require('../controllers/authController');
const validators = require('../validators/authValidators');
const { requireAuth } = require('../middleware/auth');

router.post('/signup', validators.signupRules, controller.signup);
router.post('/login', validators.loginRules, controller.login);
router.put('/password', requireAuth, validators.changePasswordRules, controller.changePassword);

module.exports = router;