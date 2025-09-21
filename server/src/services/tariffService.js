const { v4: uuidv4 } = require('uuid');
const { pool } = require('../utils/database');
const logger = require('../utils/logger');

class TariffService {
  async createTariff({ code, name, description, durationDays, price, maxVisits, features = [], isBestOffer = false }) {
    const query = `
      INSERT INTO tariffs (code, name, description, duration_days, price, max_visits, features, is_best_offer)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        code,
        name,
        description,
        durationDays,
        price,
        maxVisits,
        features.length > 0 ? features : null, // если нет фич — null
        isBestOffer
      ]);

      logger.info(`Tariff created: ${name} (${code})`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating tariff:', error);
      throw error;
    }
  }
  async getAllTariffs(filters, sortBy = "created_at", sortOrder = "DESC") {
    try {
      const { limit, offset, name } = filters;

      let query = `
        SELECT * FROM tariffs
      `;
      const values = [];
      const conditions = [];

      if (name) {
        values.push(`%${name}%`);
        conditions.push(`name ILIKE $${values.length}`);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }

      // сортировка
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      // пагинация
      if (limit) {
        values.push(limit);
        query += ` LIMIT $${values.length}`;
      }
      if (offset) {
        values.push(offset);
        query += ` OFFSET $${values.length}`;
      }

      const result = await pool.query(query, values);

      // общее количество
      let countQuery = `SELECT COUNT(*) FROM tariffs`;
      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(" AND ")}`;
      }
      const totalResult = await pool.query(countQuery, values.slice(0, conditions.length));
      const total = parseInt(totalResult.rows[0].count, 10);

      return { tariffs: result.rows, total };
    } catch (error) {
      logger.error("Error fetching tariffs:", error);
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

}

module.exports = new TariffService();
