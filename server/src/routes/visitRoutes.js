const express = require('express');
const visitController = require('../controllers/visitController');
const { authMiddleware } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Создать посещение
router.post('/',
  authMiddleware,
  validate(schemas.createVisit),
  visitController.createVisit
);

// Получить все посещения пользователя
router.get('/user/:userId',
  authMiddleware,
  visitController.getUserVisits
);

// Получить конкретное посещение
router.get('/:id',
  authMiddleware,
  visitController.getVisit
);

// Удалить посещение
router.delete('/:id',
  authMiddleware,
  visitController.deleteVisit
);

module.exports = router;
