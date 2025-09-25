const Joi = require("joi");
const logger = require("../utils/logger"); // if you use logger

// Middleware to validate body/query/params against a schema
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join("."),
        message: detail.message
      }));

      logger?.warn("Validation error:", errorMessages);

      return res.status(400).json({
        error: "Validation Error",
        details: errorMessages
      });
    }

    // Replace request data with sanitized version
    req[property] = value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Query validation error:', errorMessages);

      return res.status(400).json({
        error: 'Validation Error',
        message: 'Query validation failed',
        details: errorMessages
      });
    }

    next();
  };
};

// Схемы валидации для посещений
const visitSchemas = {
  // ✅ Сканирование QR-кода
  scanQR: Joi.object({
    qrCode: Joi.string().required()
      .messages({
        "string.empty": "QR code is required",
        "any.required": "QR code is required"
      }),

    notes: Joi.string().max(500).optional().allow("", null)
      .messages({
        "string.max": "Notes cannot exceed 500 characters"
      })
  }),

  // ✅ Валидация QR-кода
  validateQR: Joi.object({
    qrCode: Joi.string().required()
      .messages({
        "string.empty": "QR code is required",
        "any.required": "QR code is required"
      })
  }),

  // ✅ Ручное создание посещения
  createManualVisit: Joi.object({
    userId: Joi.string().uuid().required()
      .messages({
        "string.guid": "User ID must be a valid UUID",
        "any.required": "User ID is required"
      }),

    membershipId: Joi.string().uuid().optional().allow(null)
      .messages({
        "string.guid": "Membership ID must be a valid UUID"
      }),

    notes: Joi.string().max(500).optional().allow("", null)
      .messages({
        "string.max": "Notes cannot exceed 500 characters"
      })
  }),

  // ✅ Обновление посещения
  updateVisit: Joi.object({
    checkin_method: Joi.string().valid("qr", "manual", "admin").optional()
      .messages({
        "any.only": "Check-in method must be one of: qr, manual, admin"
      }),

    notes: Joi.string().max(500).optional().allow("", null)
      .messages({
        "string.max": "Notes cannot exceed 500 characters"
      })
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  }),

  // ✅ Получение списка посещений
  getVisits: Joi.object({
    user_id: Joi.string().uuid().allow('', null).optional(),
    membership_id: Joi.string().uuid().allow('', null).optional(),
    checkin_method: Joi.string().allow('', null).optional(),
    date_from: Joi.date().iso().allow('', null).optional(),
    date_to: Joi.date().iso().allow('', null).optional(),
    user_name: Joi.string().allow('', null).optional(),
    today: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('created_at', 'checkin_method', 'user_name').default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  // ✅ Получение моих посещений
  getMyVisits: Joi.object({
    user_id: Joi.string().uuid().optional(),
    membership_id: Joi.string().uuid().optional(),
    date_from: Joi.date().iso().optional(),
    date_to: Joi.date().iso().optional(),
    user_name: Joi.string().optional(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),

  // ✅ Статистика по посещениям
  getVisitStats: Joi.object({
    user_id: Joi.string().uuid().optional()
      .messages({ "string.guid": "User ID must be a valid UUID" }),

    date_from: Joi.date().optional()
      .messages({ "date.base": "Date from must be a valid date" }),

    date_to: Joi.date().when('date_from', {
      is: Joi.exist(),
      then: Joi.date().greater(Joi.ref('date_from')),
      otherwise: Joi.date()
    }).optional()
      .messages({
        "date.base": "Date to must be a valid date",
        "date.greater": "Date to must be after date from"
      }),

    group_by_date: Joi.boolean().optional()
  }),

  // ✅ Сегодняшние посещения
  getTodayVisits: Joi.object({
    page: Joi.number().integer().min(1).default(1).optional()
      .messages({
        "number.integer": "Page must be an integer",
        "number.min": "Page must be at least 1"
      }),

    limit: Joi.number().integer().min(1).max(100).default(50).optional()
      .messages({
        "number.integer": "Limit must be an integer",
        "number.min": "Limit must be at least 1",
        "number.max": "Limit cannot exceed 100"
      })
  })
};

const membershipSchemas = {
  // ✅ Создание абонемента
  createMembership: Joi.object({
    userId: Joi.string().uuid().required()
      .messages({ "string.guid": "UserId must be a valid UUID" }),

    startDate: Joi.date().min('now').required()
      .messages({
        "date.min": "Start date cannot be in the past",
        "date.base": "Start date must be a valid date"
      }),

    endDate: Joi.date().greater(Joi.ref("startDate")).required()
      .messages({
        "date.greater": "End date must be after start date",
        "date.base": "End date must be a valid date"
      }),

    status: Joi.string().valid("active", "expired", "frozen").default("active")
      .messages({ "any.only": "Status must be one of: active, expired, frozen" }),


    paymentId: Joi.string().trim().max(255).optional().allow("", null)
      .messages({ "string.max": "Payment ID cannot exceed 255 characters" }),

    maxVisits: Joi.number().integer().positive().optional().allow(null)
      .messages({
        "number.integer": "Max visits must be an integer",
        "number.positive": "Max visits must be a positive number"
      }),
  }).custom((value, helpers) => {
    // Дополнительная валидация в зависимости от типа абонемента
    const { type, startDate, endDate } = value;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    switch (type) {
      case 'single':
        // Разовый абонемент должен быть на 1 день и иметь maxVisits = 1
        if (diffInDays > 1) {
          return helpers.error('custom.singleDuration', { type });
        }
        if (!value.maxVisits || value.maxVisits !== 1) {
          value.maxVisits = 1; // Автоматически устанавливаем для разового
        }
        break;

      case 'monthly':
        // Месячный абонемент должен быть от 28 до 35 дней
        if (diffInDays < 28 || diffInDays > 35) {
          return helpers.error('custom.monthlyDuration', { type });
        }
        break;

      case 'yearly':
        // Годовой абонемент должен быть от 360 до 370 дней
        if (diffInDays < 360 || diffInDays > 370) {
          return helpers.error('custom.yearlyDuration', { type });
        }
        break;
    }

    return value;
  }, 'Membership type validation').messages({
    'custom.singleDuration': 'Single membership must be for 1 day only',
    'custom.monthlyDuration': 'Monthly membership must be between 28-35 days',
    'custom.yearlyDuration': 'Yearly membership must be between 360-370 days'
  }),

  // ✅ Обновление абонемента
  updateMembership: Joi.object({
    startDate: Joi.date().optional()
      .messages({ "date.base": "Start date must be a valid date" }),

    endDate: Joi.date().when('startDate', {
      is: Joi.exist(),
      then: Joi.date().greater(Joi.ref('startDate')),
      otherwise: Joi.date()
    }).optional()
      .messages({
        "date.greater": "End date must be after start date",
        "date.base": "End date must be a valid date"
      }),

    status: Joi.string().valid("active", "expired", "frozen").optional()
      .messages({ "any.only": "Status must be one of: active, expired, frozen" }),

    price: Joi.number().min(0).precision(2).optional()
      .messages({
        "number.min": "Price cannot be negative",
        "number.base": "Price must be a valid number"
      }),

    paymentId: Joi.string().trim().max(255).optional().allow("", null)
      .messages({ "string.max": "Payment ID cannot exceed 255 characters" }),

    maxVisits: Joi.number().integer().positive().optional().allow(null)
      .messages({
        "number.integer": "Max visits must be an integer",
        "number.positive": "Max visits must be a positive number"
      }),

    usedVisits: Joi.number().integer().min(0).optional()
      .when('maxVisits', {
        is: Joi.number().exist(),
        then: Joi.number().max(Joi.ref('maxVisits')),
        otherwise: Joi.number()
      })
      .messages({
        "number.integer": "Used visits must be an integer",
        "number.min": "Used visits cannot be negative",
        "number.max": "Used visits cannot exceed max visits"
      })
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  }),

  // ✅ Фильтры для получения списка абонементов
  getMemberships: Joi.object({
    status: Joi.string().valid("active", "expired", "frozen").optional(),
    type: Joi.string().valid("single", "monthly", "yearly").optional(),
    user_id: Joi.string().uuid().optional(),
    user_name: Joi.string().trim().min(1).max(100).optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(10).optional()
  }),

  // ✅ Валидация параметров для статистики
  getMembershipStats: Joi.object({
    user_id: Joi.string().uuid().optional()
      .messages({ "string.guid": "User ID must be a valid UUID" })
  }),

  // ✅ Валидация UUID параметров в URL
  uuidParam: Joi.string().uuid().required()
    .messages({
      "string.guid": "Parameter must be a valid UUID",
      "any.required": "Parameter is required"
    }),

  // ✅ Валидация для поиска пользователей
  userSearch: Joi.object({
    q: Joi.string().trim().min(1).max(100).optional()
      .messages({
        "string.min": "Search query must be at least 1 character",
        "string.max": "Search query cannot exceed 100 characters"
      }),
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(50).default(10).optional()
  })
};

// Кастомные валидаторы
const customValidators = {
  /**
   * Валидация периода дат (не более 1 года)
   */
  validateDateRange: (req, res, next) => {
    const { date_from, date_to } = req.query;

    if (date_from && date_to) {
      const fromDate = new Date(date_from);
      const toDate = new Date(date_to);
      const diffInDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));

      if (diffInDays > 365) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Date range cannot exceed 365 days',
          details: [{
            field: 'dateRange',
            message: 'Maximum allowed date range is 365 days'
          }]
        });
      }
    }

    next();
  },

  /**
   * Валидация QR-кода на базовом уровне
   */
  validateQRFormat: (req, res, next) => {
    const { qrCode } = req.body;

    if (!qrCode) {
      return next();
    }

    // Проверяем, что это base64 строка
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;

    if (!base64Regex.test(qrCode)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid QR code format',
        details: [{
          field: 'qrCode',
          message: 'QR code must be a valid base64 string'
        }]
      });
    }

    // Проверяем минимальную длину
    if (qrCode.length < 20) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'QR code is too short',
        details: [{
          field: 'qrCode',
          message: 'QR code appears to be invalid (too short)'
        }]
      });
    }

    next();
  },

  /**
   * Валидация существования пользователя для ручного создания посещения
   */
  validateUserExistsForVisit: async (req, res, next) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return next();
      }

      const { pool } = require('../config/database');
      const result = await pool.query(
        'SELECT id, name, email FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'User not found',
          details: [{
            field: 'userId',
            message: 'Specified user does not exist'
          }]
        });
      }

      // Добавляем информацию о пользователе в запрос
      req.targetUser = result.rows[0];
      next();

    } catch (error) {
      logger.error('Validate user exists error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  /**
   * Валидация лимита на количество запросов статистики
   */
  validateStatsRequest: (req, res, next) => {
    const { date_from, date_to, group_by_date } = req.query;

    // Если запрашивается группировка по дням, ограничиваем период
    if (group_by_date === 'true' && date_from && date_to) {
      const fromDate = new Date(date_from);
      const toDate = new Date(date_to);
      const diffInDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));

      if (diffInDays > 90) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Date range for grouped statistics cannot exceed 90 days',
          details: [{
            field: 'dateRange',
            message: 'Maximum allowed date range for grouped stats is 90 days'
          }]
        });
      }
    }

    next();
  }
};

const authSchemas = {
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
    dateOfBirth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional()
  })


};

const tariffSchemas = {
  createTariffSchema: Joi.object({
    code: Joi.string().trim().min(3).max(50).required(),        // Уникальный код тарифа
    name: Joi.string().trim().min(3).max(100).required(),       // Название
    description: Joi.string().trim().allow(null, '').max(500),  // Описание (необязательное)
    durationDays: Joi.number().integer().min(1).required(),     // Срок действия (дни)
    price: Joi.number().precision(2).positive().required(),     // Цена
    maxVisits: Joi.number().integer().min(0).allow(null),       // Максимум посещений (0 = безлимит)
    features: Joi.array().items(Joi.string().trim().max(100)),  // Массив строк (фичи)
    isBestOffer: Joi.boolean().default(false)                   // Лучшее предложение
  }),
  updateTariffSchema : Joi.object({
    code: Joi.string().trim().min(3).max(50),
    name: Joi.string().trim().min(3).max(100),
    description: Joi.string().trim().allow(null, '').max(500),
    durationDays: Joi.number().integer().min(1),
    price: Joi.number().precision(2).positive(),
    maxVisits: Joi.number().integer().min(0).allow(null),
    features: Joi.array().items(Joi.string().trim().max(100)),
    isBestOffer: Joi.boolean()
  }).min(1)
}


const createPaymentSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  amount: Joi.number().positive().required(),
  method: Joi.string().valid("cash", "card", "payme", "click").required(),
  tariffId: Joi.string().uuid().required()
});

const confirmPaymentSchema = Joi.object({
  type: Joi.string().optional(),        // если хочешь вручную передавать
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  maxVisits: Joi.number().integer().min(1).optional()
});

// Middleware для применения кастомных валидаторов
const applyCustomValidation = (validators) => {
  return (req, res, next) => {
    let index = 0;

    const runNext = (error) => {
      if (error) {
        return next(error);
      }

      if (index >= validators.length) {
        return next();
      }

      const validator = validators[index++];
      validator(req, res, runNext);
    };

    runNext();
  };
};

module.exports = {
  validateQuery,
  validate,
  authSchemas,
  visitSchemas,
  customValidators,
  membershipSchemas,
  applyCustomValidation,
  createPaymentSchema,
  confirmPaymentSchema,
  tariffSchemas,

  // Комбинированные валидаторы для различных эндпоинтов
  validateScanQR: [
    customValidators.validateQRFormat
  ],

  validateManualVisit: [
    customValidators.validateUserExistsForVisit
  ],

  validateVisitStats: [
    customValidators.validateDateRange,
    customValidators.validateStatsRequest
  ],

  validateGetVisits: [
    customValidators.validateDateRange
  ]
};