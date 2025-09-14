const { v4: uuidv4 } = require('uuid');
const { pool } = require('../utils/database');
const logger = require('../utils/logger');

class TariffService {
  async createTariff({ code, name, description, durationDays, price, maxVisits }) {
    const id = uuidv4();

    const query = `
      INSERT INTO tariffs (id, code, name, description, duration_days, price, max_visits)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        id,
        code,
        name,
        description,
        durationDays,
        price,
        maxVisits
      ]);

      logger.info(`Tariff created: ${name} (${code})`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating tariff:', error);
      throw error;
    }
  }

  async getAllTariffs() {
    const query = `SELECT * FROM tariffs ORDER BY price ASC`;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching tariffs:', error);
      throw error;
    }
  }

  async getTariffById(id) {
    const query = `SELECT * FROM tariffs WHERE id = $1`;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching tariff:', error);
      throw error;
    }
  }

  async updateTariff(id, updates) {
    const { code, name, description, durationDays, price, maxVisits } = updates;

    const query = `
      UPDATE tariffs
      SET code = COALESCE($2, code),
          name = COALESCE($3, name),
          description = COALESCE($4, description),
          duration_days = COALESCE($5, duration_days),
          price = COALESCE($6, price),
          max_visits = COALESCE($7, max_visits),
          updated_at = now()
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        id,
        code,
        name,
        description,
        durationDays,
        price,
        maxVisits
      ]);

      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error updating tariff:', error);
      throw error;
    }
  }

  async deleteTariff(id) {
    const query = `DELETE FROM tariffs WHERE id = $1 RETURNING id`;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] ? true : false;
    } catch (error) {
      logger.error('Error deleting tariff:', error);
      throw error;
    }
  }

  async getTariffById(id) {
    const query = `SELECT * FROM tariffs WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = new TariffService();
