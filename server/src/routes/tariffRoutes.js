const express = require('express');
const router = express.Router();
const tariffController = require('../controllers/tariffsController');
const {authMiddleware, requireRole} = require("../middleware/auth");
const {validate, tariffSchemas} = require("../middleware/validation");

// CRUD для тарифов
router.post('/', authMiddleware, validate(tariffSchemas.createTariffSchema), requireRole(["admin"]), tariffController.createTariff);
router.get('/all', tariffController.getAllTariffs);
router.get('/:id', tariffController.getTariffById);
router.put('/:id',authMiddleware, requireRole(["admin", "trainer"]), validate(tariffSchemas.updateTariffSchema), tariffController.updateTariff);
router.delete('/:id',authMiddleware, requireRole(["admin"]), tariffController.deleteTariff);

module.exports = router;
