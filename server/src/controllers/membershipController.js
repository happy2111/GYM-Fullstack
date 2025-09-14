const membershipService = require('../services/membershipService');
const logger = require('../utils/logger');

class MembershipController {
  // Создание нового абонемента
  async createMembership(req, res) {
    try {
      const { userId, type, startDate, endDate, status, price, paymentId, maxVisits } = req.body;
      const userRole = req.user?.role;

      // Проверяем права доступа
      if (userRole !== 'admin' && userId !== req.user.userId) {
        return res.status(403).json({
          message: 'Access denied. You can only create memberships for yourself'
        });
      }

      const membership = await membershipService.createMembership({
        userId,
        type,
        startDate,
        endDate,
        status,
        price,
        paymentId,
        maxVisits
      });

      logger.info(`Membership created: ${membership.id} by user ${req.user.userId}`);

      res.status(201).json({
        message: 'Membership created successfully',
        membership
      });
    } catch (error) {
      logger.error('Create membership error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Получение абонемента по ID
  async getMembershipById(req, res) {
    try {
      const { id } = req.params;
      const { userId, role } = req.user;

      // Проверяем права доступа
      const hasAccess = await membershipService.checkMembershipAccess(id, userId, role);
      if (!hasAccess) {
        return res.status(404).json({ message: 'Membership not found' });
      }

      const membership = await membershipService.getMembershipById(id);

      if (!membership) {
        return res.status(404).json({ message: 'Membership not found' });
      }

      res.json({ membership });
    } catch (error) {
      logger.error('Get membership error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Получение списка абонементов
  async getMemberships(req, res) {
    try {
      const { userId, role } = req.user;
      const {
        status,
        type,
        user_id: filterUserId,
        user_name: userName,
        page = 1,
        limit = 10
      } = req.query;

      const offset = (page - 1) * limit;
      const filters = {
        status,
        type,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      let memberships;

      if (role === 'admin') {
        // Админ может видеть все абонементы с фильтрами
        filters.userId = filterUserId;
        filters.userName = userName;
        memberships = await membershipService.getAllMemberships(filters);
      } else {
        // Обычный пользователь видит только свои абонементы
        memberships = await membershipService.getUserMemberships(userId, filters);
      }

      res.json({
        memberships,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: memberships.length
        }
      });
    } catch (error) {
      logger.error('Get memberships error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Получение абонементов пользователя
  async getUserMemberships(req, res) {
    try {
      const { userId: targetUserId } = req.params;
      const { userId, role } = req.user;
      const { status, type, page = 1, limit = 10 } = req.query;

      // Проверяем права доступа
      if (role !== 'admin' && targetUserId !== userId) {
        return res.status(403).json({
          message: 'Access denied. You can only view your own memberships'
        });
      }

      const offset = (page - 1) * limit;
      const filters = {
        status,
        type,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const memberships = await membershipService.getUserMemberships(targetUserId, filters);

      res.json({
        memberships,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: memberships.length
        }
      });
    } catch (error) {
      logger.error('Get user memberships error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Обновление абонемента
  async updateMembership(req, res) {
    try {
      const { id } = req.params;
      const { userId, role } = req.user;
      const updateData = req.body;

      // Проверяем права доступа
      const hasAccess = await membershipService.checkMembershipAccess(id, userId, role);
      if (!hasAccess) {
        return res.status(404).json({ message: 'Membership not found' });
      }

      // Обычные пользователи могут изменять ограниченный набор полей
      if (role !== 'admin') {
        const allowedFields = ['status']; // Пользователь может только заморозить/разморозить абонемент
        const filteredData = {};

        for (const field of allowedFields) {
          if (updateData[field] !== undefined) {
            filteredData[field] = updateData[field];
          }
        }

        if (Object.keys(filteredData).length === 0) {
          return res.status(403).json({
            message: 'You can only update status field'
          });
        }

        updateData = filteredData;
      }

      const updatedMembership = await membershipService.updateMembership(id, updateData);

      logger.info(`Membership updated: ${id} by user ${userId}`);

      res.json({
        message: 'Membership updated successfully',
        membership: updatedMembership
      });
    } catch (error) {
      logger.error('Update membership error:', error);

      if (error.message === 'Membership not found') {
        return res.status(404).json({ message: error.message });
      }

      if (error.message === 'No valid fields to update') {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: error.message });
    }
  }

  // Удаление абонемента
  async deleteMembership(req, res) {
    try {
      const { id } = req.params;
      const { userId, role } = req.user;

      // Только админ может удалять абонементы
      if (role !== 'admin') {
        return res.status(403).json({
          message: 'Access denied. Only admins can delete memberships'
        });
      }

      const deletedMembership = await membershipService.deleteMembership(id);

      logger.info(`Membership deleted: ${id} by admin ${userId}`);

      res.json({
        message: 'Membership deleted successfully',
        membership: deletedMembership
      });
    } catch (error) {
      logger.error('Delete membership error:', error);

      if (error.message === 'Membership not found') {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({ message: error.message });
    }
  }

  // Получение активного абонемента пользователя
  async getActiveMembership(req, res) {
    try {
      const { userId: targetUserId } = req.params;
      const { userId, role } = req.user;

      // Проверяем права доступа
      if (role !== 'admin' && targetUserId !== userId) {
        return res.status(403).json({
          message: 'Access denied. You can only view your own active membership'
        });
      }

      const activeMembership = await membershipService.getActiveMembership(targetUserId);

      if (!activeMembership) {
        return res.status(404).json({
          message: 'No active membership found'
        });
      }

      res.json({ membership: activeMembership });
    } catch (error) {
      logger.error('Get active membership error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Получение собственного активного абонемента
  async getMyActiveMembership(req, res) {
    try {
      const { userId } = req.user;

      const activeMembership = await membershipService.getActiveMembership(userId);

      if (!activeMembership) {
        return res.status(404).json({
          message: 'You don\'t have an active membership'
        });
      }

      res.json({ membership: activeMembership });
    } catch (error) {
      logger.error('Get my active membership error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Получение статистики по абонементам
  async getMembershipStats(req, res) {
    try {
      const { userId, role } = req.user;
      const { user_id: targetUserId } = req.query;

      let stats;

      if (role === 'admin') {
        // Админ может получить общую статистику или статистику конкретного пользователя
        stats = await membershipService.getMembershipStats(targetUserId);
      } else {
        // Обычный пользователь получает только свою статистику
        stats = await membershipService.getMembershipStats(userId);
      }

      res.json({ stats });
    } catch (error) {
      logger.error('Get membership stats error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Обновление просроченных абонементов (админ)
  async updateExpiredMemberships(req, res) {
    try {
      const { role } = req.user;

      // Только админ может выполнять эту операцию
      if (role !== 'admin') {
        return res.status(403).json({
          message: 'Access denied. Only admins can update expired memberships'
        });
      }

      const expiredMemberships = await membershipService.updateExpiredMemberships();

      res.json({
        message: `Updated ${expiredMemberships.length} expired memberships`,
        count: expiredMemberships.length,
        memberships: expiredMemberships
      });
    } catch (error) {
      logger.error('Update expired memberships error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Увеличение счетчика использованных посещений
  async incrementUsedVisits(req, res) {
    try {
      const { id } = req.params;
      const { userId, role } = req.user;

      // Проверяем права доступа
      const hasAccess = await membershipService.checkMembershipAccess(id, userId, role);
      if (!hasAccess) {
        return res.status(404).json({ message: 'Membership not found' });
      }

      const updatedMembership = await membershipService.incrementUsedVisits(id);

      res.json({
        message: 'Visit recorded successfully',
        membership: updatedMembership
      });
    } catch (error) {
      logger.error('Increment used visits error:', error);

      if (error.message === 'Membership not found') {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new MembershipController();