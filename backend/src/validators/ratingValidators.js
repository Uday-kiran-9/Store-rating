const { body } = require('express-validator');
const { validate } = require('./authValidators');

exports.ratingRules = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be a whole number from 1 to 5')
    .toInt(),
  validate,
];