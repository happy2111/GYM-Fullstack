const { pool } = require('../utils/database');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const membershipService = require('./membershipService');
const crypto = require('crypto');

class VisitService {
  /**
   * Генерация QR-кода для пользователя
   * Формат: base64(userId:membershipId:timestamp:hash)
   */
  generateQRData(userId, membershipId) {
    const timestamp = Date.now();
    const secret = process.env.QR_SECRET || 'gym-secret-key';

    // Создаем хеш для защиты от подделки
    const dataToHash = `${userId}:${membershipId}:${timestamp}`;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(dataToHash)
      .digest('hex')
      .substring(0, 16); // Берем первые 16 символов

    const qrData = `${userId}:${membershipId}:${timestamp}:${hash}`;
    return Buffer.from(qrData).toString('base64');
  }

  /**
   * Парсинг и валидация QR-кода
   */
  parseQRData(qrCode) {
    try {
      const decoded = Buffer.from(qrCode, 'base64').toString('utf-8');
      const [userId, membershipId, timestamp, hash] = decoded.split(':');

      if (!userId || !membershipId || !timestamp || !hash) {
        throw new Error('Invalid QR format');
      }

      // Проверяем время действия QR (например, 5 минут)
      const qrAge = Date.now() - parseInt(timestamp);
      const maxAge = 5 * 60 * 1000; // 5 минут

      if (qrAge > maxAge) {
        throw new Error('QR code expired');
      }

      // Проверяем хеш
      const secret = process.env.QR_SECRET || 'gym-secret-key';
      const dataToHash = `${userId}:${membershipId}:${timestamp}`;
      const expectedHash = crypto
        .createHmac('sha256', secret)
        .update(dataToHash)
        .digest('hex')
        .substring(0, 16);

      if (hash !== expectedHash) {
        throw new Error('Invalid QR signature');
      }

      return { userId, membershipId, timestamp: parseInt(timestamp) };
    } catch (error) {
      throw new Error(`Invalid QR code: ${error.message}`);
    }
  }

  /**
   * Валидация QR-кода без создания посещения (предпросмотр)
   */
  async validateQR(qrCode) {
    try {
      // Парсим QR-код
      const qrData = this.parseQRData(qrCode);
      const { userId, membershipId, timestamp } = qrData;

      // Получаем данные пользователя
      const userQuery = 'SELECT id, name, email FROM users WHERE id = $1';
      const userResult = await pool.query(userQuery, [userId]);

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Получаем и проверяем абонемент
      const membership = await membershipService.getMembershipById(membershipId);

      if (!membership) {
        throw new Error('Membership not found');
      }

      if (membership.user_id !== userId) {
        throw new Error('Membership does not belong to this user');
      }

      // Проверяем статус и срок действия абонемента
      const now = new Date();
      const endDate = new Date(membership.end_date);
      const startDate = new Date(membership.start_date);

      let warnings = [];

      if (membership.status !== 'active') {
        warnings.push(`Membership status is ${membership.status}`);
      }

      if (now < startDate) {
        warnings.push('Membership has not started yet');
      }

      if (now > endDate) {
        warnings.push('Membership has expired');
      }

      if (membership.max_visits && membership.used_visits >= membership.max_visits) {
        warnings.push('Visit limit exceeded');
      }

      // Проверяем, не было ли уже посещения сегодня
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todayVisitQuery = `
        SELECT id FROM visits 
        WHERE user_id = $1 AND visited_at >= $2 AND visited_at <= $3
      `;
      const todayVisitResult = await pool.query(todayVisitQuery, [
        userId, todayStart, todayEnd
      ]);

      if (todayVisitResult.rows.length > 0) {
        warnings.push('User already visited today');
      }

      return {
        valid: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        membership: {
          id: membership.id,
          type: membership.type,
          status: membership.status,
          usedVisits: membership.used_visits,
          maxVisits: membership.max_visits,
          remainingVisits: membership.max_visits ?
            membership.max_visits - membership.used_visits : null,
          startDate: membership.start_date,
          endDate: membership.end_date
        },
        qrData: {
          userId,
          membershipId,
          timestamp,
          age: Date.now() - timestamp
        },
        warnings
      };

    } catch (error) {
      logger.error('Validate QR error:', error);
      throw error;
    }
  }

  /**
   * Создание записи о посещении через QR-код
   */
  async createVisitByQR(qrCode, checkinMethod = 'qr', notes = null, adminUserId = null) {
    try {
      // Парсим QR-код
      const { userId, membershipId } = this.parseQRData(qrCode);

      // Проверяем существование пользователя
      const userQuery = 'SELECT id, name, email FROM users WHERE id = $1';
      const userResult = await pool.query(userQuery, [userId]);

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Получаем и проверяем абонемент
      const membership = await membershipService.getMembershipById(membershipId);

      if (!membership) {
        throw new Error('Membership not found');
      }

      if (membership.user_id !== userId) {
        throw new Error('Membership does not belong to this user');
      }

      // Проверяем активность абонемента
      const now = new Date();
      const endDate = new Date(membership.end_date);
      const startDate = new Date(membership.start_date);

      if (membership.status !== 'active') {
        throw new Error(`Membership is ${membership.status}`);
      }

      if (now < startDate) {
        throw new Error('Membership has not started yet');
      }

      if (now > endDate) {
        throw new Error('Membership has expired');
      }

      // Проверяем лимит посещений
      if (membership.max_visits && membership.used_visits >= membership.max_visits) {
        throw new Error('Visit limit exceeded');
      }

      // Проверяем, не было ли уже посещения сегодня (опционально)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todayVisitQuery = `
        SELECT id FROM visits 
        WHERE user_id = $1 AND visited_at >= $2 AND visited_at <= $3
      `;
      const todayVisitResult = await pool.query(todayVisitQuery, [
        userId, todayStart, todayEnd
      ]);

      // Создаем запись о посещении
      const visitId = uuidv4();
      const visitQuery = `
        INSERT INTO visits (id, user_id, membership_id, checkin_method, notes, visited_at, created_by)
        VALUES ($1, $2, $3, $4, $5, NOW(), $6)
        RETURNING *
      `;

      const visitResult = await pool.query(visitQuery, [
        visitId, userId, membershipId, checkinMethod, notes, adminUserId
      ]);

      // Увеличиваем счетчик использованных посещений
      await membershipService.incrementUsedVisits(membershipId);

      // Получаем обновленные данные абонемента
      const updatedMembership = await membershipService.getMembershipById(membershipId);

      logger.info(`Visit created via QR: ${visitId} for user ${userId}`, {
        userId,
        membershipId,
        checkinMethod,
        adminUserId,
        isRepeatVisitToday: todayVisitResult.rows.length > 0
      });

      return {
        visit: visitResult.rows[0],
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        membership: {
          id: updatedMembership.id,
          type: updatedMembership.type,
          usedVisits: updatedMembership.used_visits,
          maxVisits: updatedMembership.max_visits,
          remainingVisits: updatedMembership.max_visits ?
            updatedMembership.max_visits - updatedMembership.used_visits : null,
          endDate: updatedMembership.end_date
        },
        warnings: todayVisitResult.rows.length > 0 ?
          ['User already visited today'] : []
      };

    } catch (error) {
      logger.error('Create visit by QR error:', error);
      throw error;
    }
  }

  /**
   * Ручное создание посещения (админом)
   */
  async createVisitManually(userId, membershipId = null, checkinMethod = 'manual', notes = null, adminUserId = null) {
    try {
      // Если membershipId не указан, берем активный абонемент
      let membership;
      if (membershipId) {
        membership = await membershipService.getMembershipById(membershipId);
      } else {
        membership = await membershipService.getActiveMembership(userId);
      }

      if (!membership) {
        throw new Error('No active membership found');
      }

      // Проверяем активность абонемента (аналогично QR методу)
      // Проверяем активность абонемента
      const now = new Date();

    // Проверка по статусу
      if (membership.status !== 'active') {
        throw new Error(`Membership is ${membership.status}`);
      }

    // Проверка по сроку действия (если он есть)
      if (membership.end_date && now > new Date(membership.end_date)) {
        throw new Error('Membership has expired');
      }

    // Проверка по лимиту визитов (если он есть)
      if (membership.max_visits && membership.used_visits >= membership.max_visits) {
        throw new Error('Visit limit exceeded');
      }

      // Создаем запись о посещении
      const visitId = uuidv4();
      const visitQuery = `
        INSERT INTO visits (id, user_id, membership_id, checkin_method, notes, visited_at, created_by)
        VALUES ($1, $2, $3, $4, $5, NOW(), $6)
        RETURNING *
      `;

      const visitResult = await pool.query(visitQuery, [
        visitId, userId, membership.id, checkinMethod, notes, adminUserId
      ]);

      // Увеличиваем счетчик
      await membershipService.incrementUsedVisits(membership.id);

      const updatedMembership = await membershipService.getMembershipById(membership.id);

      logger.info(`Manual visit created: ${visitId} for user ${userId} by admin ${adminUserId}`);

      return {
        visit: visitResult.rows[0],
        membership: {
          id: updatedMembership.id,
          type: updatedMembership.type,
          usedVisits: updatedMembership.used_visits,
          maxVisits: updatedMembership.max_visits,
          remainingVisits: updatedMembership.max_visits ?
            updatedMembership.max_visits - updatedMembership.used_visits : null
        }
      };

    } catch (error) {
      logger.error('Create manual visit error:', error);
      throw error;
    }
  }

  /**
   * Получение посещения по ID
   */
  async getVisitById(visitId) {
    const query = `
      SELECT v.*, 
             u.name as user_name, u.email as user_email,
             m.type as membership_type, m.status as membership_status,
             creator.name as created_by_name
      FROM visits v
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN memberships m ON v.membership_id = m.id
      LEFT JOIN users creator ON v.created_by = creator.id
      WHERE v.id = $1
    `;

    try {
      const result = await pool.query(query, [visitId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Get visit by ID error:', error);
      throw error;
    }
  }

  /**
   * Получение списка посещений с фильтрами
   */
  async getVisits(filters = {}) {
    let query = `
      SELECT v.*, 
             u.name as user_name, u.email as user_email,
             m.type as membership_type, m.status as membership_status,
             creator.name as created_by_name
      FROM visits v
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN memberships m ON v.membership_id = m.id
      LEFT JOIN users creator ON v.created_by = creator.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Фильтр по пользователю
    if (filters.userId) {
      query += ` AND v.user_id = $${paramIndex}`;
      params.push(filters.userId);
      paramIndex++;
    }

    // Фильтр по абонементу
    if (filters.membershipId) {
      query += ` AND v.membership_id = $${paramIndex}`;
      params.push(filters.membershipId);
      paramIndex++;
    }

    // Фильтр по методу входа
    if (filters.checkinMethod) {
      query += ` AND v.checkin_method = $${paramIndex}`;
      params.push(filters.checkinMethod);
      paramIndex++;
    }

    // Фильтр по дате (от)
    if (filters.dateFrom) {
      query += ` AND v.visited_at >= $${paramIndex}`;
      params.push(filters.dateFrom);
      paramIndex++;
    }

    // Фильтр по дате (до)
    if (filters.dateTo) {
      query += ` AND v.visited_at <= ${paramIndex}`;
      params.push(filters.dateTo);
      paramIndex++;
    }

    // Поиск по имени пользователя
    if (filters.userName) {
      query += ` AND u.name ILIKE ${paramIndex}`;
      params.push(`%${filters.userName}%`);
      paramIndex++;
    }

    // Только сегодняшние посещения
    if (filters.today) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      query += ` AND v.visited_at >= ${paramIndex} AND v.visited_at <= ${paramIndex + 1}`;
      params.push(todayStart, todayEnd);
      paramIndex += 2;
    }

    query += ` ORDER BY v.visited_at DESC`;

    // Пагинация
    if (filters.limit) {
      query += ` LIMIT ${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      query += ` OFFSET ${paramIndex}`;
      params.push(filters.offset);
      paramIndex++;
    }

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Get visits error:', error);
      throw error;
    }
  }

  /**
   * Получение посещений пользователя
   */
  async getUserVisits(userId, filters = {}) {
    const visitFilters = { ...filters, userId };
    return this.getVisits(visitFilters);
  }

  /**
   * Обновление посещения
   */
  async updateVisit(visitId, updateData) {
    const allowedFields = ['checkin_method', 'notes'];
    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = ${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    params.push(visitId);

    const query = `
      UPDATE visits 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = ${paramIndex}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        throw new Error('Visit not found');
      }

      logger.info(`Visit updated: ${visitId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Update visit error:', error);
      throw error;
    }
  }

  /**
   * Удаление посещения
   */
  async deleteVisit(visitId) {
    try {
      // Получаем данные посещения перед удалением
      const visit = await this.getVisitById(visitId);

      if (!visit) {
        throw new Error('Visit not found');
      }

      // Удаляем посещение
      const deleteQuery = 'DELETE FROM visits WHERE id = $1 RETURNING *';
      const deleteResult = await pool.query(deleteQuery, [visitId]);

      // Уменьшаем счетчик использованных посещений
      if (visit.membership_id) {
        const decrementQuery = `
          UPDATE memberships 
          SET used_visits = GREATEST(used_visits - 1, 0)
          WHERE id = $1
          RETURNING *
        `;
        await pool.query(decrementQuery, [visit.membership_id]);
      }

      logger.info(`Visit deleted: ${visitId}`);
      return deleteResult.rows[0];
    } catch (error) {
      logger.error('Delete visit error:', error);
      throw error;
    }
  }

  /**
   * Получение статистики по посещениям
   */
  async getVisitStats(filters = {}) {
    let query = `
      SELECT 
        COUNT(*) as total_visits,
        COUNT(CASE WHEN checkin_method = 'qr' THEN 1 END) as qr_visits,
        COUNT(CASE WHEN checkin_method = 'manual' THEN 1 END) as manual_visits,
        COUNT(CASE WHEN checkin_method = 'admin' THEN 1 END) as admin_visits,
        COUNT(DISTINCT user_id) as unique_visitors,
        DATE(visited_at) as visit_date
      FROM visits
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Фильтр по пользователю
    if (filters.userId) {
      query += ` AND user_id = ${paramIndex}`;
      params.push(filters.userId);
      paramIndex++;
    }

    // Фильтр по дате
    if (filters.dateFrom) {
      query += ` AND visited_at >= ${paramIndex}`;
      params.push(filters.dateFrom);
      paramIndex++;
    }

    if (filters.dateTo) {
      query += ` AND visited_at <= ${paramIndex}`;
      params.push(filters.dateTo);
      paramIndex++;
    }

    // Группировка по дате (если нужна детализация по дням)
    if (filters.groupByDate) {
      query += ` GROUP BY DATE(visited_at) ORDER BY visit_date DESC`;
    } else {
      // Общая статистика
      query = query.replace(', DATE(visited_at) as visit_date', '');
    }

    try {
      const result = await pool.query(query, params);
      return filters.groupByDate ? result.rows : result.rows[0];
    } catch (error) {
      logger.error('Get visit stats error:', error);
      throw error;
    }
  }

  /**
   * Проверка возможности посещения для пользователя
   */
  async canUserVisit(userId) {
    try {
      const membership = await membershipService.getActiveMembership(userId);

      if (!membership) {
        return {
          canVisit: false,
          reason: 'No active membership',
          details: null
        };
      }

      const now = new Date();
      const endDate = new Date(membership.end_date);

      if (membership.status !== 'active') {
        return {
          canVisit: false,
          reason: `Membership is ${membership.status}`,
          details: { status: membership.status }
        };
      }

      if (now > endDate) {
        return {
          canVisit: false,
          reason: 'Membership expired',
          details: { endDate: membership.end_date }
        };
      }

      if (membership.max_visits && membership.used_visits >= membership.max_visits) {
        return {
          canVisit: false,
          reason: 'Visit limit exceeded',
          details: {
            usedVisits: membership.used_visits,
            maxVisits: membership.max_visits
          }
        };
      }

      return {
        canVisit: true,
        membership: {
          id: membership.id,
          type: membership.type,
          usedVisits: membership.used_visits,
          maxVisits: membership.max_visits,
          remainingVisits: membership.max_visits ?
            membership.max_visits - membership.used_visits : null,
          endDate: membership.end_date
        }
      };

    } catch (error) {
      logger.error('Check user can visit error:', error);
      throw error;
    }
  }

  /**
   * Получение сводки посещений за сегодня
   */
  async getTodaySummary() {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // Общая статистика за день
      const statsQuery = `
        SELECT 
          COUNT(*) as total_visits,
          COUNT(CASE WHEN checkin_method = 'qr' THEN 1 END) as qr_visits,
          COUNT(CASE WHEN checkin_method = 'manual' THEN 1 END) as manual_visits,
          COUNT(CASE WHEN checkin_method = 'admin' THEN 1 END) as admin_visits,
          COUNT(DISTINCT user_id) as unique_visitors
        FROM visits
        WHERE visited_at >= $1 AND visited_at <= $2
      `;

      const statsResult = await pool.query(statsQuery, [todayStart, todayEnd]);
      const stats = statsResult.rows[0];

      // Статистика по часам
      const hourlyQuery = `
        SELECT 
          EXTRACT(HOUR FROM visited_at) as hour,
          COUNT(*) as visits_count
        FROM visits
        WHERE visited_at >= $1 AND visited_at <= $2
        GROUP BY EXTRACT(HOUR FROM visited_at)
        ORDER BY hour
      `;

      const hourlyResult = await pool.query(hourlyQuery, [todayStart, todayEnd]);

      // Последние посещения
      const recentQuery = `
        SELECT v.id, v.visited_at, v.checkin_method, v.notes,
               u.name as user_name, u.email as user_email,
               m.type as membership_type
        FROM visits v
        LEFT JOIN users u ON v.user_id = u.id
        LEFT JOIN memberships m ON v.membership_id = m.id
        WHERE v.visited_at >= $1 AND v.visited_at <= $2
        ORDER BY v.visited_at DESC
        LIMIT 10
      `;

      const recentResult = await pool.query(recentQuery, [todayStart, todayEnd]);

      // Топ активных пользователей за день
      const topUsersQuery = `
        SELECT 
          u.name as user_name,
          u.email as user_email,
          COUNT(*) as visits_count
        FROM visits v
        LEFT JOIN users u ON v.user_id = u.id
        WHERE v.visited_at >= $1 AND v.visited_at <= $2
        GROUP BY u.id, u.name, u.email
        ORDER BY visits_count DESC
        LIMIT 10
      `;

      const topUsersResult = await pool.query(topUsersQuery, [todayStart, todayEnd]);

      return {
        date: todayStart.toISOString().split('T')[0],
        stats: {
          totalVisits: parseInt(stats.total_visits),
          qrVisits: parseInt(stats.qr_visits),
          manualVisits: parseInt(stats.manual_visits),
          adminVisits: parseInt(stats.admin_visits),
          uniqueVisitors: parseInt(stats.unique_visitors)
        },
        hourlyStats: hourlyResult.rows.map(row => ({
          hour: parseInt(row.hour),
          visitsCount: parseInt(row.visits_count)
        })),
        recentVisits: recentResult.rows,
        topUsers: topUsersResult.rows.map(row => ({
          userName: row.user_name,
          userEmail: row.user_email,
          visitsCount: parseInt(row.visits_count)
        }))
      };

    } catch (error) {
      logger.error('Get today summary error:', error);
      throw error;
    }
  }

  /**
   * Получение статистики посещений за период (для дашборда)
   */
  async getDashboardStats(filters = {}) {
    try {
      const { dateFrom, dateTo } = filters;

      let dateFilter = '';
      const params = [];
      let paramIndex = 1;

      if (dateFrom && dateTo) {
        dateFilter = ` AND visited_at >= ${paramIndex} AND visited_at <= ${paramIndex + 1}`;
        params.push(dateFrom, dateTo);
        paramIndex += 2;
      } else if (dateFrom) {
        dateFilter = ` AND visited_at >= ${paramIndex}`;
        params.push(dateFrom);
        paramIndex++;
      } else if (dateTo) {
        dateFilter = ` AND visited_at <= ${paramIndex}`;
        params.push(dateTo);
        paramIndex++;
      }

      // Общая статистика
      const generalStatsQuery = `
        SELECT 
          COUNT(*) as total_visits,
          COUNT(DISTINCT user_id) as unique_visitors,
          COUNT(CASE WHEN checkin_method = 'qr' THEN 1 END) as qr_visits,
          COUNT(CASE WHEN checkin_method = 'manual' THEN 1 END) as manual_visits,
          COUNT(CASE WHEN checkin_method = 'admin' THEN 1 END) as admin_visits
        FROM visits
        WHERE 1=1 ${dateFilter}
      `;

      const generalStats = await pool.query(generalStatsQuery, params);

      // Статистика по дням
      const dailyStatsQuery = `
        SELECT 
          DATE(visited_at) as date,
          COUNT(*) as visits_count,
          COUNT(DISTINCT user_id) as unique_visitors
        FROM visits
        WHERE 1=1 ${dateFilter}
        GROUP BY DATE(visited_at)
        ORDER BY date DESC
        LIMIT 30
      `;

      const dailyStats = await pool.query(dailyStatsQuery, params);

      // Пиковые часы
      const peakHoursQuery = `
        SELECT 
          EXTRACT(HOUR FROM visited_at) as hour,
          COUNT(*) as visits_count
        FROM visits
        WHERE 1=1 ${dateFilter}
        GROUP BY EXTRACT(HOUR FROM visited_at)
        ORDER BY visits_count DESC
      `;

      const peakHours = await pool.query(peakHoursQuery, params);

      return {
        general: generalStats.rows[0],
        daily: dailyStats.rows,
        peakHours: peakHours.rows.map(row => ({
          hour: parseInt(row.hour),
          visitsCount: parseInt(row.visits_count)
        }))
      };

    } catch (error) {
      logger.error('Get dashboard stats error:', error);
      throw error;
    }
  }

  /**
   * Получение активности пользователя (для профиля)
   */
  async getUserActivity(userId, limit = 30) {
    try {
      const query = `
        SELECT 
          v.id,
          v.visited_at,
          v.checkin_method,
          v.notes,
          m.type as membership_type,
          m.id as membership_id
        FROM visits v
        LEFT JOIN memberships m ON v.membership_id = m.id
        WHERE v.user_id = $1
        ORDER BY v.visited_at DESC
        LIMIT $2
      `;

      const result = await pool.query(query, [userId, limit]);

      // Статистика пользователя
      const userStatsQuery = `
        SELECT 
          COUNT(*) as total_visits,
          COUNT(CASE WHEN visited_at >= date_trunc('month', CURRENT_DATE) THEN 1 END) as this_month_visits,
          COUNT(CASE WHEN visited_at >= date_trunc('week', CURRENT_DATE) THEN 1 END) as this_week_visits,
          MAX(visited_at) as last_visit,
          MIN(visited_at) as first_visit
        FROM visits
        WHERE user_id = $1
      `;

      const userStats = await pool.query(userStatsQuery, [userId]);

      return {
        recentVisits: result.rows,
        stats: userStats.rows[0]
      };

    } catch (error) {
      logger.error('Get user activity error:', error);
      throw error;
    }
  }
}

module.exports = new VisitService();