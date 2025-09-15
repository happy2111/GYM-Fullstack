const tariffsService = require('../services/tariffService');
const logger = require('../utils/logger');

class TariffsController {
  async getAllTariffs(req, res) {
    try {
      const tariffs = await tariffsService.getAllTariffs();
      res.status(200).json(tariffs);
    } catch (error) {
      logger.error('Error fetching tariffs:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = new TariffsController();
