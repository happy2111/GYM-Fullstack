const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authMiddleware, optionalAuth, requireRole } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const {validate, createPaymentSchema, confirmPaymentSchema} = require("../middleware/validation");
const clickController = require("../controllers/clickController");

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

router.post("/click/prepare", clickController.prepare)
router.post("/click/complete", clickController.complete)
router.post("/click/checkout", authMiddleware, clickController.checkout)

router.get("/stats", authMiddleware, requireRole(['admin', 'trainer']) ,paymentController.getPaymentsStats)


router.get(
  "/get-payments",
  authMiddleware,
  paymentController.getPayments
)

router.delete('/:id', authMiddleware, requireRole(['admin']), paymentController.deletePayment)


module.exports = router;
