const express = require('express');
const membershipController = require('../controllers/membershipController');
const { authMiddleware, requireRole} = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Создать абонемент
router.post('/',
  authMiddleware,
  validate(schemas.createMembership),
  membershipController.createMembership
);

// Получить все абонементы пользователя
router.get('/user/:userId',
  authMiddleware,
  membershipController.getUserMemberships
);

// Получить конкретный абонемент
router.get('/:id',
  authMiddleware,
  membershipController.getMembership
);

// Обновить абонемент
router.put('/:id',
  authMiddleware,
  requireRole(["admin", "trainer"]),
  validate(schemas.updateMembership),
  membershipController.updateMembership
);

// Удалить абонемент
router.delete('/:id',
  authMiddleware,
  requireRole(["admin", "trainer"]),
  membershipController.deleteMembership
);

module.exports = router;
