const { body, validationResult } = require('express-validator');

const nameRule = body('name')
  .trim()
  .isLength({ min: 20, max: 60 })
  .withMessage('Name must be 20-60 characters');

const emailRule = body('email')
  .trim()
  .toLowerCase()
  .isEmail()
  .withMessage('Enter a valid email');

const passwordRule = (field = 'password') =>
  body(field)
    .matches(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/)
    .withMessage(
      'Password must be 8-16 characters with at least one uppercase letter and one special character'
    );

const addressRule = body('address')
  .trim()
  .notEmpty()
  .withMessage('Address is required')
  .isLength({ max: 400 })
  .withMessage('Address must be at most 400 characters');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

exports.signupRules = [nameRule, emailRule, passwordRule(), addressRule, validate];

exports.loginRules = [
  body('email').trim().toLowerCase().isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

exports.changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordRule('newPassword'),
  validate,
];

exports.nameRule = nameRule;
exports.emailRule = emailRule;
exports.passwordRule = passwordRule;
exports.addressRule = addressRule;
exports.validate = validate;