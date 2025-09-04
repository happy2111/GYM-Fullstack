const Joi = require('joi');
const logger = require('../utils/logger');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Validation error:', errorMessages);

      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errorMessages
      });
    }

    next();
  };
};

const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD (для сравнения дат)

const schemas = {
  register: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional().allow(''),
    dateOfBirth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional().allow(''),
    date_of_birth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional()
  }),

  // ✅ Membership
  createMembership: Joi.object({
    user_id: Joi.string().uuid().required(),
    type: Joi.string().valid('monthly', 'yearly', 'trial', 'custom').required(),
    start_date: Joi.date().min(today).required()
      .messages({ 'date.min': 'Start date cannot be in the past' }),
    end_date: Joi.date().greater(Joi.ref('start_date')).min(today).required()
      .messages({
        'date.greater': 'End date must be after start date',
        'date.min': 'End date cannot be in the past'
      }),
    status: Joi.string().valid('active', 'inactive', 'expired').default('active')
  }),

  updateMembership: Joi.object({
    type: Joi.string().valid('monthly', 'yearly', 'trial', 'custom').optional(),
    start_date: Joi.date().min(today).optional()
      .messages({ 'date.min': 'Start date cannot be in the past' }),
    end_date: Joi.date().greater(Joi.ref('start_date')).min(today).optional()
      .messages({
        'date.greater': 'End date must be after start date',
        'date.min': 'End date cannot be in the past'
      }),
    status: Joi.string().valid('active', 'inactive', 'expired').optional()
  }),

  // ✅ Visit
  createVisit: Joi.object({
    user_id: Joi.string().uuid().required(),
    membership_id: Joi.string().uuid().optional(),
    visit_date: Joi.date().max('now').required()
      .messages({ 'date.max': 'Visit date cannot be in the future' }),
    status: Joi.string().valid('entered', 'exited', 'pending').default('entered')
  })
};

module.exports = {
  validate,
  schemas
};
