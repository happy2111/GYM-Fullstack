const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware, requireRole} = require('../middleware/auth');

const router = express.Router();


router.get('/all',
  authMiddleware,
  requireRole(['admin', 'trainer']),
  userController.getAllUsers
);

router.get('/stats', authMiddleware, requireRole(['admin', 'trainer']), userController.getUserStats);

router.delete('/:id', authMiddleware, requireRole(['admin']), userController.deleteUser);

// ==========================================
// ОБРАБОТКА ОШИБОК
// ==========================================


// Middleware для обработки несуществующих маршрутов
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Users endpoint not found'
  });
});

module.exports = router;