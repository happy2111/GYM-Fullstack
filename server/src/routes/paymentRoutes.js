const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authMiddleware, optionalAuth, requireRole } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const {validate, createPaymentSchema, confirmPaymentSchema} = require("../middleware/validation");



const router = express.Router();

router.post(
  "/create-payment",
  authMiddleware,
  validate(createPaymentSchema),
  paymentController.createPayment
)

router.post(
  "/confirm/:id",
  authMiddleware,
  validate(confirmPaymentSchema),
  requireRole(['admin', 'trainer']),
  paymentController.confirmPayment
)


router.get(
  "/get-payments",
  authMiddleware,
  paymentController.getPayments
)


module.exports = router;
