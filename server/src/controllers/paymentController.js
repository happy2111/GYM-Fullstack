const paymentService = require('../services/paymentService');
const membershipService = require('../services/membershipService');
const logger = require('../utils/logger');
const tariffService = require('../services/tariffService');
const { addMonths } = require('date-fns');

class PaymentController {
  // Создание платежа
  async createPayment(req, res) {
    try {
      const { userId, amount, method, tariffId } = req.body;
      const { userId: currentUserId, role } = req.user;

      // Проверяем права: админ может создавать для других, пользователь — только для себя
      // if (role !== 'admin' && userId !== currentUserId) {
      //   return res.status(403).json({ message: 'Access denied' });
      // }

      const tariff = await tariffService.getTariffById(tariffId);
      if (!tariff) {
        return res.status(404).json({ message: 'Tariff not found' });
      }

      // 1. Создаём платеж со статусом pending
      const payment = await paymentService.createPayment({
        userId,
        amount,
        method,
        tariffId,
      });

      // 2. Проверяем метод оплаты
      if (method === 'cash') {
        // Админ вручную подтверждает оплату
        return res.status(201).json({
          message: 'Cash payment created, waiting for admin confirmation',
          payment
        });
      }

      res.status(201).json({ payment });
    } catch (error) {
      logger.error('Create payment error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Подтверждение платежа (например, админ подтверждает наличку)
  async confirmPayment(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.user;

      if (role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can confirm payments' });
      }

      const payment = await paymentService.updateStatus(id, 'completed');
      const tariff = await tariffService.getTariffById(payment.tariff_id);
      if (!tariff) {
        return res.status(404).json({ message: 'Tariff not found' });
      }

      const startDate = new Date();
      let endDate = null;
      let maxVisits = null;

      if (tariff.duration_days) {
        endDate = new Date(startDate.getTime() + tariff.duration_days * 24 * 60 * 60 * 1000);
      }

      if (tariff.max_visits) {
        maxVisits = tariff.max_visits;
      }

      const membership = await membershipService.createMembership({
        userId: payment.user_id,
        startDate,
        endDate,
        paymentId: payment.id,
        maxVisits,
        tariffId: tariff.id,
      });

      await paymentService.attachMembership(payment.id, membership.id);

      res.json({
        message: 'Payment confirmed and membership created',
        payment,
        membership,
        tariff
      });
    } catch (error) {
      logger.error('Confirm payment error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Получение списка платежей
  async getPayments(req, res) {
    try {
      const { role, id: userId } = req.user;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      let payments;
      if (role === 'admin') {
        payments = await paymentService.getAllPayments();
      } else {
        payments = await paymentService.getPaymentsByUser(userId);
      }

      res.json({ payments });
    } catch (error) {
      logger.error('Get payments error:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new PaymentController();
