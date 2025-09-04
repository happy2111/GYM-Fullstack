const { v4: uuidv4 } = require('uuid');
const { pool } = require('../utils/database');
const logger = require('../utils/logger');

class MembershipService {
  async createMembership(userId, { type, startDate, endDate }) {
    const query = `
      INSERT INTO memberships (id, user_id, type, start_date, end_date, status)
      VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING *
    `;

    const id = uuidv4();

    try {
      const result = await pool.query(query, [id, userId, type, startDate, endDate]);
      logger.info(`Membership created for user: ${userId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating membership:', error);
      throw error;
    }
  }

  async getMembershipsByUser(userId) {
    const query = `SELECT * FROM memberships WHERE user_id = $1 ORDER BY created_at DESC`;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching memberships:', error);
      throw error;
    }
  }

  async updateMembershipStatus(id, status) {
    const query = `
      UPDATE memberships
      SET status = $2
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [id, status]);
      if (result.rows.length === 0) throw new Error('Membership not found');
      logger.info(`Membership status updated: ${id} -> ${status}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating membership:', error);
      throw error;
    }
  }

  async getActiveMembership(userId) {
    const query = `
      SELECT * FROM memberships
      WHERE user_id = $1 AND status = 'active' AND end_date >= NOW()
      ORDER BY end_date DESC LIMIT 1
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching active membership:', error);
      throw error;
    }
  }
}

module.exports = new MembershipService();
