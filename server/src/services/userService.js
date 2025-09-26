const {pool} = require("../utils/database");
const logger = require("../utils/logger");

class UserService {
  async getAllUsers(limit = 50, offset = 0, sortBy = "created_at", sortOrder = "DESC", search = "") {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (search) {
      conditions.push(`
      (
        CAST(id AS TEXT) ILIKE $${idx} OR 
        LOWER(name) ILIKE $${idx} OR 
        LOWER(email) ILIKE $${idx} OR 
        phone ILIKE $${idx}
      )
    `);
      values.push(`%${search.toLowerCase()}%`);
      idx++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
        SELECT id, name, email, phone, role, is_verified, created_at
        FROM users ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
    LIMIT $${idx++}
        OFFSET $${idx++}
    `;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    const countQuery = `
        SELECT COUNT(*)
        FROM users ${whereClause}
    `;
    const countResult = await pool.query(countQuery, values.slice(0, -2));
    const total = parseInt(countResult.rows[0].count, 10);

    return {
      users: result.rows,
      total
    };
  }

  async getTotalUsers() {
    const query = `SELECT COUNT(*) AS total
                   FROM users`;
    const result = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  }

  /**
   * Пользователи по ролям (client / trainer / admin)
   */
  async getUsersByRole() {
    const query = `
        SELECT role, COUNT(*) AS count
        FROM users
        GROUP BY role
    `;
    const result = await pool.query(query);
    return result.rows; // [{role: "client", count: "50"}, ...]
  }

  /**
   * Пользователи по гендеру
   */
  async getUsersByGender() {
    const query = `
        SELECT gender, COUNT(*) AS count
        FROM users
        GROUP BY gender
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Новые пользователи за последние N дней
   */
  async getNewUsers(days = 30) {
    const query = `
        SELECT COUNT(*) AS count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '${days} days'
    `;
    const result = await pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Рост пользователей по дням (для графиков)
   */
  async getDailyRegistrations(days = 30) {
    const query = `
        SELECT DATE (created_at) AS date, COUNT (*) AS count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE (created_at)
        ORDER BY date ASC
    `;
    const result = await pool.query(query);
    return result.rows; // [{date: '2025-09-01', count: 5}, ...]
  }

  /**
   * Сводная статистика
   */
  async getUserStats() {
    const totalUsers = await this.getTotalUsers();
    const byRole = await this.getUsersByRole();
    const byGender = await this.getUsersByGender();
    const newUsers = await this.getNewUsers(30);
    const dailyRegistrations = await this.getDailyRegistrations(30);

    return {
      totalUsers,
      byRole,
      byGender,
      newUsers,
      dailyRegistrations,
    };
  }


  async deleteUser(userId) {
    const query = `
        DELETE FROM users
        WHERE id = $1
        RETURNING id
    `;
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0] ? true : false;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

}

module.exports = new UserService();
