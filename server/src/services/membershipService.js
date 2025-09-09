const { v4: uuidv4 } = require('uuid');
const { pool } = require('../utils/database');
const logger = require('../utils/logger');

class MembershipService {
  async createMembership(userId, { type, startDate, endDate, price }) {
    const query = `
        INSERT INTO memberships (id, user_id, type, start_date, end_date, status, price)
        VALUES ($1, $2, $3, $4, $5, 'active', $6)
            RETURNING *
    `;

    const id = uuidv4();

    try {
      const result = await pool.query(query, [
        id,
        userId,
        type,
        startDate,
        endDate,
        price,
      ]);
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

  async getMembershipsById(userId) {
    const query = `SELECT * FROM memberships WHERE id = $1 ORDER BY created_at DESC`;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching memberships:', error);
      throw error;
    }
  }

  async updateMembership(id, updates) {
    const allowedFields = ["type", "start_date", "end_date", "status", "price"];
    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        setClauses.push(`${key} = $${idx}`);
        values.push(updates[key]);
        idx++;
      }
    }

    if (setClauses.length === 0) {
      throw new Error("No valid fields provided for update");
    }

    const query = `
    UPDATE memberships
    SET ${setClauses.join(", ")}, updated_at = NOW()
    WHERE id = $${idx}
    RETURNING *
  `;

    values.push(id);

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error("Membership not found");
      }
      logger.info(`Membership ${id} updated`);
      return result.rows[0];
    } catch (error) {
      logger.error("Error updating membership:", error);
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
