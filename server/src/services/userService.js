const { pool } = require("../utils/database");

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
    FROM users
    ${whereClause}
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT $${idx++} OFFSET $${idx++}
  `;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    const countQuery = `
    SELECT COUNT(*) 
    FROM users
    ${whereClause}
  `;
    const countResult = await pool.query(countQuery, values.slice(0, -2));
    const total = parseInt(countResult.rows[0].count, 10);

    return {
      users: result.rows,
      total
    };
  }
}

module.exports = new UserService();
