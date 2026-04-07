const { body, param, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Failed',
      details: errors.array()
    });
  }
  next();
};

// User validations
const validateUser = [
  body('name').notEmpty().withMessage('Name is required').isLength({ min: 2 }),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['artist', 'fan']).withMessage('Role must be artist or fan'),
  validateRequest
];

// Track validations
const validateTrack = [
  body('title').notEmpty().withMessage('Title is required'),
  body('file_url').isURL().withMessage('Valid file URL is required'),
  body('genre').optional(),
  body('duration').optional().isInt({ min: 0 }),
  body('price_model').optional().isIn(['free', 'pay-what-you-want', 'fixed']),
  body('suggested_price').optional().isFloat({ min: 0 }),
  validateRequest
];

// Interaction validations
const validateInteraction = [
  body('type').isIn(['play', 'like', 'comment', 'purchase', 'share']).withMessage('Invalid interaction type'),
  body('comment_text').if(body('type').equals('comment')).notEmpty().withMessage('Comment text required for comments'),
  body('purchase_amount').if(body('type').equals('purchase')).isFloat({ min: 0 }).withMessage('Valid purchase amount required'),
  validateRequest
];

const validateIdParam = [
  param('id').isInt().withMessage('ID must be an integer'),
  validateRequest
];

module.exports = {
  validateUser,
  validateTrack,
  validateInteraction,
  validateIdParam,
  validateRequest
};