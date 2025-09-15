const express = require('express');
const tariffController = require('../controllers/tariffsController');
const { authMiddleware, optionalAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get("/all", tariffController.getAllTariffs)

module.exports = router;
