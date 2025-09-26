const logger = require('../utils/logger');
const userService = require('../services/userService');
const authService = require('../services/authService');

class UserController {
  async getAllUsers(req, res) {
    try {
      const { id: userId, role } = req.user;

      if (!userId || role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const offset = (page - 1) * limit;

      const allowedSort = ['created_at', 'name', 'email'];
      const sortBy = allowedSort.includes(req.query.sortBy) ? req.query.sortBy : 'created_at';
      const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';

      // добавляем search
      const search = req.query.search?.trim() || "";

      const { users, total } = await userService.getAllUsers(
        limit,
        offset,
        sortBy,
        sortOrder,
        search
      );

      res.json({
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error(`Get users error (userId: ${req.user?.id}):`, error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }


  async getUserStats(req, res) {
    try {
      const stats = await userService.getUserStats();
      res.json({ data: stats });
    } catch (error) {
      logger.error("Get user stats error:", error);
      res.status(500).json({ message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const user = authService.findUserById(id)
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const result = await userService.deleteUser(id);
      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });


    }catch (error) {
      logger.error("Delete user error:", error);
      res.status(500).json({ message: error.message });
    }
  }

}

module.exports = new UserController();
