const { v4: uuidv4 } = require('uuid');
const { pool } = require('../utils/database');
const logger = require('../utils/logger');

class VisitService {
  async logVisit(userId, method = 'qr') {
    const query = `
      INSERT INTO visits (id, user_id, checkin_method)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const id = uuidv4();

    try {
      const result = await pool.query(query, [id, userId, method]);
      logger.info(`Visit logged: user ${userId}, method: ${method}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error logging visit:', error);
      throw error;
    }
  }

  async getVisitsByUser(userId, limit = 50) {
    const query = `
      SELECT * FROM visits
      WHERE user_id = $1
      ORDER BY visited_at DESC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching visits:', error);
      throw error;
    }
  }

  async getVisitCountByUser(userId, fromDate, toDate) {
    let query = `SELECT COUNT(*) FROM visits WHERE user_id = $1`;
    const params = [userId];
    let idx = 2;

    if (fromDate) {
      query += ` AND visited_at >= $${idx}`;
      params.push(fromDate);
      idx++;
    }

    if (toDate) {
      query += ` AND visited_at <= $${idx}`;
      params.push(toDate);
    }

    try {
      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      logger.error('Error counting visits:', error);
      throw error;
    }
  }
}

module.exports = new VisitService();
