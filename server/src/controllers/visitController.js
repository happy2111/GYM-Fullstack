const visitService = require('../services/visitService');
const logger = require('../utils/logger');
const tariffService = require('../services/tariffService');

class VisitController {
  /**
   * Генерация QR-кода для пользователя
   * GET /api/visits/qr
   */
  async generateQR(req, res) {
    try {
      const { id: userId } = req.user;

      // Проверяем возможность посещения
      const canVisitResult = await visitService.canUserVisit(userId);

      if (!canVisitResult.canVisit) {
        return res.status(400).json({
          message: `Cannot generate QR: ${canVisitResult.reason}`,
          details: canVisitResult.details
        });
      }

      const membership = canVisitResult.membership;
      const qrData = visitService.generateQRData(userId, membership.id);

      res.json({
        qrCode: qrData,
        membership: {
          id: membership.id,
          type: membership.type,
          remainingVisits: membership.remainingVisits,
          endDate: membership.endDate
        },
        expiresIn: 300 // QR действует 5 минут
      });

    } catch (error) {
      logger.error('Generate QR error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Валидация QR-кода без создания посещения (предпросмотр)
   * POST /api/visits/validate-qr
   */
  async validateQR(req, res) {
    try {
      const { qrCode } = req.body;
      const { role } = req.user;

      // Только админы и тренеры могут валидировать QR
      if (role !== 'admin' && role !== 'trainer') {
        return res.status(403).json({
          message: 'Access denied. Only admins and trainers can validate QR codes'
        });
      }

      const result = await visitService.parseQRData(qrCode);

      res.json(result);

    } catch (error) {
      logger.error('Validate QR error:', error);

      const qrErrorMessages = {
        'Invalid QR format': 'QR код имеет неверный формат',
        'QR code expired': 'QR код истек',
        'Invalid QR signature': 'QR код поврежден или подделан',
        'User not found': 'Пользователь не найден',
        'Membership not found': 'Абонемент не найден',
        'Membership does not belong to this user': 'Абонемент не принадлежит данному пользователю'
      };

      const userMessage = qrErrorMessages[error.message] || error.message;

      res.status(400).json({
        valid: false,
        message: userMessage
      });
    }
  }

  /**
   * Сканирование QR-кода и создание посещения
   * POST /api/visits/scan
   */
  async scanQR(req, res) {
    try {
      const { qrCode, notes } = req.body;

      const result = await visitService.createVisitByQR(
        qrCode,
        'qr',
        notes,
        adminUserId
      );

      logger.info(`QR scan successful by ${adminUserId}`, {
        userId: result.user.id,
        visitId: result.visit.id
      });

      res.status(201).json({
        message: 'Visit recorded successfully',
        visit: result.visit,
        user: result.user,
        membership: result.membership,
        warnings: result.warnings || []
      });

    } catch (error) {
      logger.error('Scan QR error:', error);

      // Специфичные ошибки для QR
      const qrErrorMessages = {
        'Invalid QR format': 'QR код имеет неверный формат',
        'QR code expired': 'QR код истек',
        'Invalid QR signature': 'QR код поврежден или подделан',
        'User not found': 'Пользователь не найден',
        'Membership not found': 'Абонемент не найден',
        'Membership does not belong to this user': 'Абонемент не принадлежит данному пользователю',
        'Membership has expired': 'Срок абонемента истек',
        'Visit limit exceeded': 'Превышен лимит посещений',
        'Membership has not started yet': 'Абонемент еще не начался'
      };

      const userMessage = qrErrorMessages[error.message] || error.message;

      res.status(400).json({
        message: userMessage,
        error: error.message
      });
    }
  }

  /**
   * Ручное создание посещения
   * POST /api/visits/manual
   */
  async createManualVisit(req, res) {
    try {
      const { userId, membershipId, notes } = req.body;
      const adminUserId = req.user.userId;
      const { role } = req.user;

      // Только админы могут создавать ручные посещения
      if (role !== 'admin') {
        return res.status(403).json({
          message: 'Access denied. Only admins can create manual visits'
        });
      }

      const result = await visitService.createVisitManually(
        userId,
        membershipId,
        'admin',
        notes,
        adminUserId
      );

      logger.info(`Manual visit created by admin ${adminUserId}`, {
        userId,
        visitId: result.visit.id
      });

      res.status(201).json({
        message: 'Manual visit recorded successfully',
        visit: result.visit,
        membership: result.membership
      });

    } catch (error) {
      logger.error('Create manual visit error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Получение посещения по ID
   * GET /api/visits/:id
   */
  async getVisitById(req, res) {
    try {
      const { id } = req.params;
      const { userId, role } = req.user;

      const visit = await visitService.getVisitById(id);

      if (!visit) {
        return res.status(404).json({ message: 'Visit not found' });
      }

      // Пользователи могут видеть только свои посещения
      if (role !== 'admin' && role !== 'trainer' && visit.user_id !== userId) {
        return res.status(404).json({ message: 'Visit not found' });
      }

      res.json({ visit });

    } catch (error) {
      logger.error('Get visit by ID error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Получение списка посещений
   * GET /api/visits
   */
  async getVisits(req, res) {
    try {
      const { userId, role } = req.user;
      const {
        user_id: filterUserId,
        membership_id: membershipId,
        checkin_method: checkinMethod,
        date_from: dateFrom,
        date_to: dateTo,
        user_name: userName,
        today,
        page = 1,
        limit = 20
      } = req.query;

      const offset = (page - 1) * limit;
      const filters = {
        membershipId,
        checkinMethod,
        dateFrom,
        dateTo,
        userName,
        today: today === 'true',
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      // Если не админ/тренер, показываем только собственные посещения
      if (role === 'admin' || role === 'trainer') {
        filters.userId = filterUserId; // Может быть undefined - покажет все
      } else {
        filters.userId = userId; // Только свои посещения
      }

      const visits = await visitService.getVisits(filters);

      res.json({
        visits,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: visits.length
        }
      });

    } catch (error) {
      logger.error('Get visits error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Получение моих посещений
   * GET /api/visits/me
   */
  async getMyVisits(req, res) {
    try {
      const { userId } = req.user;
      const {
        date_from: dateFrom,
        date_to: dateTo,
        page = 1,
        limit = 20
      } = req.query;

      const offset = (page - 1) * limit;
      const filters = {
        dateFrom,
        dateTo,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const visits = await visitService.getUserVisits(userId, filters);

      res.json({
        visits,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: visits.length
        }
      });

    } catch (error) {
      logger.error('Get my visits error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Обновление посещения
   * PUT /api/visits/:id
   */
  async updateVisit(req, res) {
    try {
      const { id } = req.params;
      const { role, userId } = req.user;
      const updateData = req.body;

      // Только админы могут обновлять посещения
      if (role !== 'admin') {
        return res.status(403).json({
          message: 'Access denied. Only admins can update visits'
        });
      }

      const updatedVisit = await visitService.updateVisit(id, updateData);

      logger.info(`Visit updated: ${id} by admin ${userId}`);

      res.json({
        message: 'Visit updated successfully',
        visit: updatedVisit
      });

    } catch (error) {
      logger.error('Update visit error:', error);

      if (error.message === 'Visit not found') {
        return res.status(404).json({ message: error.message });
      }

      if (error.message === 'No valid fields to update') {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Удаление посещения
   * DELETE /api/visits/:id
   */
  async deleteVisit(req, res) {
    try {
      const { id } = req.params;
      const { role, userId } = req.user;

      // Только админы могут удалять посещения
      if (role !== 'admin') {
        return res.status(403).json({
          message: 'Access denied. Only admins can delete visits'
        });
      }

      const deletedVisit = await visitService.deleteVisit(id);

      logger.info(`Visit deleted: ${id} by admin ${userId}`);

      res.json({
        message: 'Visit deleted successfully',
        visit: deletedVisit
      });

    } catch (error) {
      logger.error('Delete visit error:', error);

      if (error.message === 'Visit not found') {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Получение статистики посещений
   * GET /api/visits/stats
   */
  async getVisitStats(req, res) {
    try {
      const { userId, role } = req.user;
      const {
        user_id: filterUserId,
        date_from: dateFrom,
        date_to: dateTo,
        group_by_date: groupByDate
      } = req.query;

      const filters = {
        dateFrom,
        dateTo,
        groupByDate: groupByDate === 'true'
      };

      // Если не админ/тренер, показываем только собственную статистику
      if (role === 'admin' || role === 'trainer') {
        filters.userId = filterUserId;
      } else {
        filters.userId = userId;
      }

      const stats = await visitService.getVisitStats(filters);

      res.json({ stats });

    } catch (error) {
      logger.error('Get visit stats error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Проверка возможности посещения для пользователя
   * GET /api/visits/can-visit/:userId
   */
  async checkCanVisit(req, res) {
    try {
      const { userId: targetUserId } = req.params;
      const { userId, role } = req.user;

      // Пользователи могут проверить только себя, админы - любого
      if (role !== 'admin' && role !== 'trainer' && targetUserId !== userId) {
        return res.status(403).json({
          message: 'Access denied'
        });
      }

      const result = await visitService.canUserVisit(targetUserId);

      res.json(result);

    } catch (error) {
      logger.error('Check can visit error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Получение сводки посещений за сегодня
   * GET /api/visits/today-summary
   */
  async getTodaySummary(req, res) {
    try {
      const { role } = req.user;

      // Только админы и тренеры могут видеть общую сводку
      if (role !== 'admin' && role !== 'trainer') {
        return res.status(403).json({
          message: 'Access denied'
        });
      }

      const summary = await visitService.getTodaySummary();

      res.json({ summary });

    } catch (error) {
      logger.error('Get today summary error:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new VisitController();