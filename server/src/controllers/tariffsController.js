const tariffService = require('../services/tariffService');
const logger = require('../utils/logger');

class TariffController {
  async createTariff(req, res) {
    try {
      const { code, name, description, durationDays, price, maxVisits, features, isBestOffer } = req.body;

      if (!code || !name || !price || !durationDays) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const tariff = await tariffService.createTariff({
        code,
        name,
        description,
        durationDays,
        price,
        maxVisits,
        features,
        isBestOffer
      });

      res.status(201).json(tariff);
    } catch (error) {
      logger.error('Create tariff error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAllTariffs(req, res) {
    try {
      const {
        name,
        page = 1,
        limit = 20,
        sortBy = "created_at",
        sortOrder = "DESC"
      } = req.query;

      const offset = (page - 1) * limit;
      const filters = {
        name,
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      const allowedSort = ["created_at", "name", "price"];
      const safeSortBy = allowedSort.includes(sortBy) ? sortBy : "created_at";
      const safeSortOrder = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

      const { tariffs, total } = await tariffService.getAllTariffs(filters, safeSortBy, safeSortOrder);

      res.json({
        data: tariffs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error("Get tariffs error:", error);
      res.status(500).json({ message: error.message });
    }
  }

  async getTariffById(req, res) {
    try {
      const { id } = req.params;
      const tariff = await tariffService.getTariffById(id);

      if (!tariff) {
        return res.status(404).json({ message: 'Tariff not found' });
      }

      res.json(tariff);
    } catch (error) {
      logger.error('Get tariff by id error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateTariff(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = await tariffService.updateTariff(id, updates);

      if (!updated) {
        return res.status(404).json({ message: 'Tariff not found' });
      }

      res.json(updated);
    } catch (error) {
      logger.error('Update tariff error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteTariff(req, res) {
    try {
      const { id } = req.params;
      const deleted = await tariffService.deleteTariff(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Tariff not found' });
      }

      res.json({ message: 'Tariff deleted successfully' });
    } catch (error) {
      logger.error('Delete tariff error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new TariffController();
