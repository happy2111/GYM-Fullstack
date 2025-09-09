const visitService = require('../services/visitService');
const logger = require('../utils/logger');

class VisitController {
  async createVisit(req, res) {
    try {
      const { userId, date, checkIn, checkOut } = req.body;

      const visit = await visitService.logVisit({
        userId,
        date,
        checkIn,
        checkOut,
      });

      res.status(201).json({
        message: 'Visit created successfully',
        visit,
      });
    } catch (error) {
      logger.error('Create visit error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async getUserVisits(req, res) {
    try {
      const { userId } = req.params;

      const visits = await visitService.getUserVisits(userId);

      res.json({ visits });
    } catch (error) {
      logger.error('Get user visits error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async getVisit(req, res) {
    try {
      const { id } = req.params;

      const visit = await visitService.getVisitById(id);

      if (!visit) {
        return res.status(404).json({ message: 'Visit not found' });
      }

      res.json({ visit });
    } catch (error) {
      logger.error('Get visit error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async deleteVisit(req, res) {
    try {
      const { id } = req.params;

      const deleted = await visitService.deleteVisit(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Visit not found' });
      }

      res.json({ message: 'Visit deleted successfully' });
    } catch (error) {
      logger.error('Delete visit error:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new VisitController();
