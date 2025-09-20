const { pool } = require("../utils/database");

class UserService {
  async getAllUsers(limit = 50, offset = 0, sortBy = "created_at", sortOrder = "DESC") {
    // Запрос на данные
    const query = `
      SELECT id, name, email, phone, role, is_verified, created_at
      FROM users
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $1 OFFSET $2
    `;
    const values = [limit, offset];
    const result = await pool.query(query, values);

    // Запрос на общее количество
    const countResult = await pool.query(`SELECT COUNT(*) FROM users`);
    const total = parseInt(countResult.rows[0].count, 10);

    return {
      users: result.rows,
      total
    };
  }
}

module.exports = new UserService();
