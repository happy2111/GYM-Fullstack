import api from "../http/index.js";

class UsersService {
  /**
   * Получить список пользователей
   * @param {Object} params
   * @param {number} params.page - текущая страница (по умолчанию 1)
   * @param {number} params.limit - количество записей на странице (по умолчанию 20)
   * @param {string} params.sortBy - поле сортировки (created_at, name, email)
   * @param {"asc"|"desc"} params.sortOrder - порядок сортировки
   */
  async getAllUsers({ page = 1, limit = 20, sortBy = "created_at", sortOrder = "desc" } = {}) {
    try {
      const response = await api.get("/users/all", {
        params: { page, limit, sortBy, sortOrder },
      });

      return {
        users: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("Ошибка при получении пользователей:", error);
      throw error; // пробрасываем, чтобы обработать в компоненте
    }
  }
}

export default new UsersService();
