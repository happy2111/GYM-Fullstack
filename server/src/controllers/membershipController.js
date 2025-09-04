const membershipService = require('../services/membershipService');
const logger = require('../utils/logger');

class MembershipController {
  async createMembership(req, res) {
    try {
      const { userId, type, startDate, endDate, price } = req.body;

      const membership = await membershipService.createMembership({
        userId,
        type,
        startDate,
        endDate,
        price,
      });

      res.status(201).json({
        message: 'Membership created successfully',
        membership,
      });
    } catch (error) {
      logger.error('Create membership error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async getUserMemberships(req, res) {
    try {
      const { userId } = req.params;

      const memberships = await membershipService.getUserMemberships(userId);

      res.json({ memberships });
    } catch (error) {
      logger.error('Get user memberships error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async getMembership(req, res) {
    try {
      const { id } = req.params;

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

  async updateMembership(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = await membershipService.updateMembership(id, updates);

      res.json({
        message: 'Membership updated successfully',
        membership: updated,
      });
    } catch (error) {
      logger.error('Update membership error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async deleteMembership(req, res) {
    try {
      const { id } = req.params;

      const deleted = await membershipService.deleteMembership(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Membership not found' });
      }

      res.json({ message: 'Membership deleted successfully' });
    } catch (error) {
      logger.error('Delete membership error:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new MembershipController();
