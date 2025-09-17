const { pool } = require('../utils/database');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class PaymentService {
  // 1. Создать платёж (pending)
  async createPayment({ userId, amount, method, transactionId = null, membershipId = null, tariffId = null , merchant_prepare_id}) {
    const id = uuidv4();
    const query = `
        INSERT INTO payments (id, user_id, membership_id, amount, method, status, transaction_id, tariff_id, merchant_prepare_id)
        VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, $8)
            RETURNING *;
    `;

    try {
      const result = await pool.query(query, [
        id,
        userId,
        membershipId,
        amount,
        method,
        transactionId,
        tariffId,
        merchant_prepare_id
      ]);
      return result.rows[0];
    } catch (err) {
      logger.error("Error creating payment:", err);
      throw err;
    }
  }


  // 2. Обновить статус (completed, failed, refunded)
  async updateStatus(paymentId, status, transactionId = null) {
    const query = `
      UPDATE payments
      SET status = $2,
          transaction_id = COALESCE($3, transaction_id),
          updated_at = now()
      WHERE id = $1
      RETURNING *;
    `;

    try {
      const result = await pool.query(query, [paymentId, status, transactionId]);
      logger.info(`Payment ${paymentId} updated to status: ${status}`);
      return result.rows[0];
    } catch (err) {
      logger.error("Error updating payment status:", err);
      throw err;
    }
  }

  // 3. Получить платёж по ID
  async getPaymentById(id) {
    const query = `SELECT * FROM payments WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 4. Получить все платежи пользователя
  async getPaymentsByUser(userId) {
    const query = `SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC`;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async getAllPayments() {
    const query = `SELECT * FROM payments ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return result.rows;
  }

  async getPaymentById(paymentId) {
    const query = `SELECT * FROM payments WHERE id = $1`;
    const result = await pool.query(query, [paymentId]);
    return result.rows[0] || null;
  }

  async getUserPayments(userId) {
    const query = `SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC`;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }


  // 5. Привязать платёж к membership (опционально, если создаёшь сначала payment → потом membership)
  async attachMembership(paymentId, membershipId) {
    const query = `
      UPDATE payments
      SET membership_id = $2,
          updated_at = now()
      WHERE id = $1
      RETURNING *;
    `;

    try {
      const result = await pool.query(query, [paymentId, membershipId]);
      return result.rows[0];
    } catch (err) {
      logger.error("Error attaching membership to payment:", err);
      throw err;
    }
  }

  // Проверить, есть ли уже оплаченный платёж для пользователя + тарифа
  async findPaidPayment(userId, tariffId, provider = 'click') {
    const query = `
    SELECT * FROM payments
    WHERE user_id = $1
      AND tariff_id = $2
      AND status = 'completed'
      AND method = $3
    LIMIT 1;
  `;
    const values = [userId, tariffId, provider];

    try {
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (err) {
      logger.error("Error checking paid payment:", err);
      throw err;
    }
  }

  async findByTransactionId(transactionId) {
    const query = `SELECT * FROM payments WHERE transaction_id = $1`;
    const result = await pool.query(query, [transactionId]);
    return result.rows[0] || null;
  }

  async findByPrepareId(prepareId, provider = 'click') {
    const query = `
      SELECT * FROM payments
      WHERE merchant_prepare_id = $1
        AND method = $2
      LIMIT 1;
    `;

    try {
      const result = await pool.query(query, [prepareId, provider]);
      return result.rows[0] || null;
    } catch (err) {
      logger.error("Error finding transaction by prepare_id:", err);
      throw err;
    }
  }

  async findByPrepareId(prepareId, provider) {
    const result = await pool.query(
      'SELECT * FROM payments WHERE merchant_prepare_id = $1 AND provider = $2',
      [prepareId, provider]
    );
    return result.rows[0];
  }


  async updatePrepare(paymentId, transactionId, prepareId) {
    const query = `
    UPDATE payments
    SET transaction_id = $1,
        merchant_prepare_id = $2,
        status = 'pending',
        updated_at = NOW()
    WHERE id = $3
    RETURNING *;
  `;
    const result = await pool.query(query, [transactionId, prepareId, paymentId]);
    return result.rows[0];
  }


}


module.exports = new PaymentService();