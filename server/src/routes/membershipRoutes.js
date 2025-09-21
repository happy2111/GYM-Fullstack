const express = require('express');
const membershipController = require('../controllers/membershipController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { validate, membershipSchemas } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting для операций с абонементами
const membershipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов за 15 минут
  message: 'Too many membership requests, please try again later',
  skipSuccessfulRequests: true
});

// Rate limiting для создания абонементов (более строгий)
const createMembershipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10, // максимум 10 создании абонементов за 15 минут
  message: 'Too many membership creation attempts, please try again later'
});

// ==========================================
// ПУБЛИЧНЫЕ МАРШРУТЫ (требуют авторизации)
// ==========================================

// Получить мой активный абонемент
router.get('/me/active',
  authMiddleware,
  membershipLimiter,
  membershipController.getMyActiveMembership
);

router.get('/me/all/',
  authMiddleware,
  membershipLimiter,
  membershipController.getAllUserMemberships
)


// Получить мою статистику по абонементам
router.get('/me/stats',
  authMiddleware,
  membershipLimiter,
  membershipController.getMembershipStats
);

// ==========================================
// CRUD ОПЕРАЦИИ
// ==========================================

// Создать новый абонемент
router.post('/',
  authMiddleware,
  createMembershipLimiter,
  validate(membershipSchemas.createMembership),
  membershipController.createMembership
);

// Получить список всех абонементов (с фильтрами и пагинацией)
router.get('/',
  authMiddleware,
  requireRole(['admin', 'trainer']),
  membershipLimiter,
  membershipController.getMemberships
);

// Получить конкретный абонемент по ID
router.get('/:id',
  authMiddleware,
  membershipLimiter,
  membershipController.getMembershipById
);

// Обновить абонемент
router.put('/:id',
  authMiddleware,
  membershipLimiter,
  validate(membershipSchemas.updateMembership),
  membershipController.updateMembership
);

// Удалить абонемент (только админ)
router.delete('/:id',
  authMiddleware,
  requireRole(['admin']),
  membershipLimiter,
  membershipController.deleteMembership
);

// ==========================================
// ОПЕРАЦИИ ДЛЯ РАБОТЫ С ПОЛЬЗОВАТЕЛЯМИ
// ==========================================
// Получить активный абонемент конкретного пользователя
router.get('/user/:userId/active',
  authMiddleware,
  requireRole(['admin', 'trainer']),
  membershipLimiter,
  membershipController.getActiveMembership
);

// Получить все абонементы конкретного пользователя
router.get('/user/:userId',
  authMiddleware,
  membershipLimiter,
  membershipController.getUserMemberships
);



// ==========================================
// СПЕЦИАЛЬНЫЕ ОПЕРАЦИИ
// ==========================================

// Увеличить счетчик использованных посещений
router.post('/:id/visit',
  authMiddleware,
  membershipLimiter,
  membershipController.incrementUsedVisits
);

// ==========================================
// АДМИНСКИЕ МАРШРУТЫ
// ==========================================

// Получить общую статистику по абонементам (админ)
router.get('/admin/stats',
  authMiddleware,
  requireRole(['admin', 'trainer']),
  membershipLimiter,
  membershipController.getMembershipStats
);

// Обновить просроченные абонементы (админ)
router.post('/admin/update-expired',
  authMiddleware,
  requireRole(['admin', 'trainer']),
  membershipLimiter,
  membershipController.updateExpiredMemberships
);

// ==========================================
// MIDDLEWARE ДЛЯ ВАЛИДАЦИИ ПАРАМЕТРОВ
// ==========================================

// Middleware для валидации UUID параметров
const validateUuidParam = (paramName) => {
  return (req, res, next) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const paramValue = req.params[paramName];

    if (paramValue && !uuidRegex.test(paramValue)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Invalid ${paramName} format`,
        details: [{
          field: paramName,
          message: `${paramName} must be a valid UUID`
        }]
      });
    }

    next();
  };
};

// Применяем валидацию UUID для всех маршрутов с параметром :id
router.param('id', validateUuidParam('id'));
router.param('userId', validateUuidParam('userId'));

// ==========================================
// ОБРАБОТКА ОШИБОК
// ==========================================

// Middleware для обработки ошибок валидации запросов
router.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON'
    });
  }
  next(error);
});

// Middleware для обработки несуществующих маршрутов
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Membership endpoint not found'
  });
});

module.exports = router;