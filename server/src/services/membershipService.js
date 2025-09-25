const {pool} = require('../utils/database');
const logger = require('../utils/logger');
const {v4: uuidv4,validate: isUuid} = require('uuid');

class MembershipService {
  // Создание нового абонемента
  async createMembership(membershipData) {
    const {
      userId,
      tariffId,
      startDate,
      endDate,
      status = 'active',
      paymentId,
      maxVisits,
      usedVisits = 0
    } = membershipData;

    const membershipId = uuidv4();

    const query = `
        INSERT INTO memberships (id, user_id, start_date, end_date, status,
                                 payment_id, max_visits, used_visits, tariff_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
                $9) RETURNING id, user_id, start_date, end_date, status, payment_id, max_visits, used_visits, created_at, updated_at
    `;

    try {
      const result = await pool.query(query, [
        membershipId,
        userId,
        startDate,
        endDate,
        status,
        paymentId,
        maxVisits,
        usedVisits,
        tariffId
      ]);

      logger.info(`Membership created: ${membershipId} for user ${userId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating membership:', error);
      throw error;
    }
  }


  async createMembershipByAdmin({ userId, tariffId, method = "cash", status = "completed" }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Получаем тариф
      const tariffRes = await client.query(`SELECT * FROM tariffs WHERE id = $1`, [tariffId]);
      if (tariffRes.rows.length === 0) {
        throw new Error("Tariff not found");
      }
      const tariff = tariffRes.rows[0];

      // 2. Создаём оплату
      const paymentId = uuidv4();
      const paymentRes = await client.query(
        `
        INSERT INTO payments (id, user_id, tariff_id, amount, method, status, transaction_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
        [paymentId, userId, tariffId, tariff.price, method, status, `manual-${Date.now()}`]
      );
      const payment = paymentRes.rows[0];

      // 3. Создаём абонемент
      const membershipId = uuidv4();
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + tariff.duration_days);

      const membershipRes = await client.query(
        `
        INSERT INTO memberships (id, user_id, tariff_id, payment_id, start_date, end_date, status, max_visits, used_visits)
        VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, 0)
        RETURNING *
      `,
        [membershipId, userId, tariffId, paymentId, startDate, endDate, tariff.max_visits]
      );
      const membership = membershipRes.rows[0];

      // 4. Обновляем ссылку в платежах на membership_id
      await client.query(
        `UPDATE payments SET membership_id = $1 WHERE id = $2`,
        [membershipId, paymentId]
      );

      await client.query("COMMIT");

      return { payment, membership, tariff };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // Получение абонемента по ID
  async getMembershipById(membershipId) {
    const query = `
        SELECT m.*, u.name as user_name, u.email as user_email
        FROM memberships m
                 LEFT JOIN users u ON m.user_id = u.id
        WHERE m.id = $1
    `;

    try {
      const result = await pool.query(query, [membershipId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error getting membership:', error);
      throw error;
    }
  }

  // Получение всех абонементов пользователя
  async getUserMemberships(userId, filters = {}) {
    let query = `
        SELECT m.*, u.name as user_name, u.email as user_email
        FROM memberships m
                 LEFT JOIN users u ON m.user_id = u.id
        WHERE m.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    // Фильтр по статусу
    if (filters.status) {
      query += ` AND m.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    // Фильтр по типу
    if (filters.type) {
      query += ` AND m.type = $${paramIndex}`;
      params.push(filters.type);
      paramIndex++;
    }

    query += ` ORDER BY m.created_at DESC`;

    // Пагинация
    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
      paramIndex++;
    }

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error getting user memberships:', error);
      throw error;
    }
  }

  // Получение всех абонементов (админ)
  async getAllMemberships(limit, offset, sortBy, sortOrder, { status, type, userIdFilter, userName }) {
    let where = [];
    let values = [];
    let i = 1;

    if (status) {
      where.push(`m.status = $${i++}`);
      values.push(status);
    }
    if (userIdFilter) {
      where.push(`m.user_id = $${i++}`);
      values.push(userIdFilter);
    }
    if (userName) {
      where.push(`u.name ILIKE $${i++}`);
      values.push(`%${userName}%`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    const query = `
        SELECT COUNT(*) OVER() AS total,
            m.*,
               u.name  AS user_name,
               u.email AS user_email,
               t.code  AS tariff_code,
               t.name  AS tariff_name
        FROM memberships m
                 JOIN users u ON u.id = m.user_id
                 LEFT JOIN tariffs t ON t.id = m.tariff_id
            ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
            LIMIT $${i++} OFFSET $${i}
    `;

    values.push(limit, offset);

    const result = await pool.query(query, values);

    return {
      memberships: result.rows,
      total: result.rows.length > 0 ? parseInt(result.rows[0].total, 10) : 0
    };
  }



  // Обновление абонемента
  async updateMembership(membershipId, updateData) {
    const allowedFields = ['start_date', 'end_date', 'status', 'payment_id', 'max_visits', 'used_visits'];
    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    // Формируем SET clause динамически
    for (const [key, value] of Object.entries(updateData)) {
      const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase(); // camelCase to snake_case
      if (allowedFields.includes(dbField) && value !== undefined) {
        updateFields.push(`${dbField} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    params.push(membershipId);

    const query = `
        UPDATE memberships
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex} RETURNING id, user_id, start_date, end_date, status, payment_id, max_visits, used_visits, created_at, updated_at
    `;

    try {
      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        throw new Error('Membership not found');
      }

      logger.info(`Membership updated: ${membershipId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating membership:', error);
      throw error;
    }
  }

  // Удаление абонемента
  async deleteMembership(membershipId) {
    const query = 'DELETE FROM memberships WHERE id = $1 RETURNING *';

    try {
      const result = await pool.query(query, [membershipId]);

      if (result.rows.length === 0) {
        throw new Error('Membership not found');
      }

      logger.info(`Membership deleted: ${membershipId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error deleting membership:', error);
      throw error;
    }
  }

  // Получение активного абонемента пользователя
  async getActiveMemberships(userId) {
    const query = `
        SELECT *
        FROM memberships
        WHERE user_id = $1
          AND status = 'active'
          AND end_date > CURRENT_DATE
        ORDER BY end_date DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows; // 👈 возвращаем массив всех активных
    } catch (error) {
      logger.error('Error getting active memberships:', error);
      throw error;
    }
  }


  async getAllUserMemberships(userId) {
    const query = `
        SELECT *
        FROM memberships
        WHERE user_id = $1
        ORDER BY created_at DESC
    `;
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting all user memberships:', error);
      throw error;
    }
  }

  // Проверка доступа к абонементу (пользователь может видеть только свои абонементы)
  async checkMembershipAccess(membershipId, userId, userRole) {
    if (userRole === 'admin') {
      return true; // Админ может видеть все абонементы
    }

    const query = 'SELECT user_id FROM memberships WHERE id = $1';

    try {
      const result = await pool.query(query, [membershipId]);

      if (result.rows.length === 0) {
        return false; // Абонемент не найден
      }

      return result.rows[0].user_id === userId;
    } catch (error) {
      logger.error('Error checking membership access:', error);
      throw error;
    }
  }

  // Увеличение счетчика использованных посещений
  async incrementUsedVisits(membershipId) {
    const query = `
        UPDATE memberships
        SET used_visits = used_visits + 1
        WHERE id = $1 RETURNING *
    `;

    try {
      const result = await pool.query(query, [membershipId]);

      if (result.rows.length === 0) {
        throw new Error('Membership not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error incrementing used visits:', error);
      throw error;
    }
  }

  // Получение статистики по абонементам
  async getMembershipStats(userId = null) {
    let query;
    let params = [];

    if (userId) {
      if (!isUuid(userId)) {
        throw new Error('Invalid UUID format');
      }

      // Статистика для конкретного пользователя
      query = `
          SELECT COUNT(*)                                       AS total_memberships,
                 COUNT(CASE WHEN m.status = 'active' THEN 1 END)  AS active_memberships,
                 COUNT(CASE WHEN m.status = 'expired' THEN 1 END) AS expired_memberships,
                 COUNT(CASE WHEN m.status = 'frozen' THEN 1 END)  AS frozen_memberships,
                 COALESCE(SUM(t.price), 0)                        AS total_paid,
                 COALESCE(SUM(m.used_visits), 0)                  AS total_visits_used
          FROM memberships m
                   LEFT JOIN tariffs t ON m.tariff_id = t.id
          WHERE m.user_id = $1
      `;
      params = [userId];
    } else {
      // Общая статистика (для админа)
      query = `
          SELECT COUNT(*)                                       AS total_memberships,
                 COUNT(CASE WHEN m.status = 'active' THEN 1 END)  AS active_memberships,
                 COUNT(CASE WHEN m.status = 'expired' THEN 1 END) AS expired_memberships,
                 COUNT(CASE WHEN m.status = 'frozen' THEN 1 END)  AS frozen_memberships,
                 COALESCE(SUM(t.price), 0)                        AS total_revenue,
                 COALESCE(SUM(m.used_visits), 0)                  AS total_visits,
                 COUNT(DISTINCT m.user_id)                        AS unique_users
          FROM memberships m
                   LEFT JOIN tariffs t ON m.tariff_id = t.id
      `;
    }

    try {
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting membership stats:', error);
      throw error;
    }
  }

  // Автоматическое обновление статуса просроченных абонементов
  async updateExpiredMemberships() {
    const query = `
        UPDATE memberships
        SET status = 'expired'
        WHERE status = 'active'
          AND end_date < CURRENT_DATE RETURNING id, user_id
    `;

    try {
      const result = await pool.query(query);

      if (result.rows.length > 0) {
        logger.info(`Updated ${result.rows.length} expired memberships`);
      }

      return result.rows;
    } catch (error) {
      logger.error('Error updating expired memberships:', error);
      throw error;
    }
  }

  async getActiveMembership(userId) {
    const query = `SELECT *
                   FROM memberships
                   WHERE user_id = $1
                     AND status = 'active'
                     AND end_date > CURRENT_DATE
                   ORDER BY end_date DESC LIMIT 1`;
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error getting active membership:', error);
      throw error;
    }
  }
}

module.exports = new MembershipService();