const { body } = require('express-validator');
const {
  nameRule,
  emailRule,
  passwordRule,
  addressRule,
  validate,
} = require('./authValidators');

exports.createUserRules = [
  nameRule,
  emailRule,
  passwordRule(),
  addressRule,
  body('role')
    .isIn(['ADMIN', 'USER', 'STORE_OWNER'])
    .withMessage('Role must be ADMIN, USER or STORE_OWNER'),
  validate,
];

exports.createStoreRules = [
  nameRule,
  emailRule,
  addressRule,
  body('ownerId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('ownerId must be a valid user id'),
  validate,
];