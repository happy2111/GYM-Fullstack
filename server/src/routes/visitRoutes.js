const express = require('express');
const visitController = require('../controllers/visitController');
const { authMiddleware } = require('../middleware/auth');
const { validate, validateQuery, visitSchemas } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// ==========================================
// RATE LIMITING
// ==========================================

// Общий лимит для посещений
const visitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 200, // максимум 200 запросов за 15 минут
  message: 'Too many visit requests, please try again later',
  skipSuccessfulRequests: true
});

// Строгий лимит для сканирования QR (защита от спама)
const qrScanLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 10, // максимум 10 сканирований за минуту
  message: 'Too many QR scan attempts, please try again later'
});

// Лимит для генерации QR
const qrGenerateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 20, // максимум 20 генераций QR за минуту
  message: 'Too many QR generation requests, please try again later'
});

// ==========================================
// MIDDLEWARE ДЛЯ РОЛЕЙ
// ==========================================

// Только админы и тренеры
const staffOnly = (req, res, next) => {
  const { role } = req.user;
  if (role !== 'admin' && role !== 'trainer') {
    return res.status(403).json({
      message: 'Access denied. Staff access required'
    });
  }
  next();
};

// Только админы
const adminOnly = (req, res, next) => {
  const { role } = req.user;
  if (role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied. Admin access required'
    });
  }
  next();
};

// ==========================================
// QR CODE МАРШРУТЫ
// ==========================================

// Генерация QR-кода для текущего пользователя
router.get('/qr',
  authMiddleware,
  qrGenerateLimiter,
  visitController.generateQR
);

// Сканирование QR-кода (создание посещения)
router.post('/scan',
  authMiddleware,
  staffOnly,
  qrScanLimiter,
  validate(visitSchemas.scanQR),
  visitController.scanQR
);

// Валидация QR-кода без создания посещения
router.post('/validate-qr',
  authMiddleware,
  staffOnly,
  qrScanLimiter,
  validate(visitSchemas.validateQR),
  visitController.validateQR
);

// ==========================================
// CRUD ОПЕРАЦИИ С ПОСЕЩЕНИЯМИ
// ==========================================

// Ручное создание посещения (только админ)
router.post('/manual',
  authMiddleware,
  adminOnly,
  visitLimiter,
  validate(visitSchemas.createManualVisit),
  visitController.createManualVisit
);

router.post(
  "/qr",
  authMiddleware,
  visitController.generateQR
  )

// Получение списка всех посещений (с фильтрами)
router.get('/',
  authMiddleware,
  visitLimiter,
  validateQuery(visitSchemas.getVisits),
  visitController.getVisits
);

// Получение моих посещений
router.get('/me',
  authMiddleware,
  visitLimiter,
  validateQuery(visitSchemas.getMyVisits),
  visitController.getMyVisits
);

// Получение посещения по ID
router.get('/:id',
  authMiddleware,
  visitLimiter,
  visitController.getVisitById
);

// Обновление посещения (только админ)
router.put('/:id',
  authMiddleware,
  adminOnly,
  visitLimiter,
  validate(visitSchemas.updateVisit),
  visitController.updateVisit
);

// Удаление посещения (только админ)
router.delete('/:id',
  authMiddleware,
  adminOnly,
  visitLimiter,
  visitController.deleteVisit
);


// ==========================================
// СТАТИСТИКА И АНАЛИТИКА
// ==========================================

// Статистика по посещениям
router.get('/stats/general',
  authMiddleware,
  visitLimiter,
  validateQuery(visitSchemas.getVisitStats),
  visitController.getVisitStats
);

// Сегодняшние посещения (для админ панели)
router.get('/stats/today',
  authMiddleware,
  staffOnly,
  visitLimiter,
  validateQuery(visitSchemas.getTodayVisits),
  visitController.getTodaySummary
);

// ==========================================
// ПРОВЕРКИ И ВАЛИДАЦИИ
// ==========================================

router.post('/can-visit/:userId',
  authMiddleware,
  adminOnly,
  visitLimiter,
  visitController.checkCanVisit
)


// // Проверка возможности посещения для пользователя
// router.get('/check/:userId',
//   authMiddleware,
//   visitLimiter,
//   visitController.checkUserCanVisit
// );
//
// // Проверка собственной возможности посещения
// router.get('/check-me/eligibility',
//   authMiddleware,
//   visitLimiter,
//   visitController.checkMyVisitEligibility
// );

// ==========================================
// ВАЛИДАЦИЯ UUID ПАРАМЕТРОВ
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

// Применяем валидацию UUID для маршрутов с параметрами
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
    message: 'Visit endpoint not found'
  });
});

module.exports = router;