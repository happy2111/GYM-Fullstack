const { pool } = require('../utils/database');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

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
      INSERT INTO memberships (id, user_id, start_date, end_date, status, payment_id, max_visits, used_visits, tariff_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, user_id, start_date, end_date, status, payment_id, max_visits, used_visits, created_at, updated_at
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
  async getAllMemberships(filters = {}) {
    let query = `
      SELECT m.*, u.name as user_name, u.email as user_email
      FROM memberships m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

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

    // Фильтр по пользователю
    if (filters.userId) {
      query += ` AND m.user_id = $${paramIndex}`;
      params.push(filters.userId);
      paramIndex++;
    }

    // Поиск по имени пользователя
    if (filters.userName) {
      query += ` AND u.name ILIKE $${paramIndex}`;
      params.push(`%${filters.userName}%`);
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
      logger.error('Error getting all memberships:', error);
      throw error;
    }
  }

  // Обновление абонемента
  async updateMembership(membershipId, updateData) {
    const allowedFields = ['type', 'start_date', 'end_date', 'status', 'price', 'payment_id', 'max_visits', 'used_visits'];
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
      WHERE id = $${paramIndex}
      RETURNING id, user_id, type, start_date, end_date, status, price, payment_id, max_visits, used_visits, created_at, updated_at
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
  async getActiveMembership(userId) {
    const query = `
      SELECT * FROM memberships 
      WHERE user_id = $1 AND status = 'active' AND end_date > CURRENT_DATE
      ORDER BY end_date DESC
      LIMIT 1
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error getting active membership:', error);
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
      WHERE id = $1
      RETURNING *
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
      // Статистика для конкретного пользователя
      query = `
        SELECT 
          COUNT(*) as total_memberships,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_memberships,
          COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_memberships,
          COUNT(CASE WHEN status = 'frozen' THEN 1 END) as frozen_memberships,
          COALESCE(SUM(price), 0) as total_paid,
          COALESCE(SUM(used_visits), 0) as total_visits_used
        FROM memberships
        WHERE user_id = $1
      `;
      params = [userId];
    } else {
      // Общая статистика (для админа)
      query = `
        SELECT 
          COUNT(*) as total_memberships,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_memberships,
          COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_memberships,
          COUNT(CASE WHEN status = 'frozen' THEN 1 END) as frozen_memberships,
          COALESCE(SUM(price), 0) as total_revenue,
          COALESCE(SUM(used_visits), 0) as total_visits,
          COUNT(DISTINCT user_id) as unique_users
        FROM memberships
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
      WHERE status = 'active' AND end_date < CURRENT_DATE
      RETURNING id, user_id
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
}

module.exports = new MembershipService();