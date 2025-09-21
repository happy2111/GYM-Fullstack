import api from "../http/index.js";

class TariffService {
  async getAllTariffs({ page = 1, limit = 20, sortBy = "created_at", sortOrder = "desc" } = {}) {
    try {
      const response = await api.get("/tariffs/all", {
        params: { page, limit, sortBy, sortOrder },
      });

      return {
        tariffs: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("Ошибка при получении тарифов:", error);
      throw error;
    }
  }

  async getTariffById(tariffId) {
    try {
      const response = await api.get(`/tariffs/${tariffId}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении тарифа с ID ${tariffId}:`, error);
      throw error;
    }
  }

  async createTariff(tariffData) {
    try {
      const response = await api.post("/tariffs", tariffData);
      return response.data;
    } catch (error) {
      console.error("Ошибка при создании тарифа:", error);
      throw error;
    }
  }

  async updateTariff(tariffId, tariffData) {
    try {
      const response = await api.put(`/tariffs/${tariffId}`, tariffData);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении тарифа с ID ${tariffId}:`, error);
      throw error;
    }
  }

  async deleteTariff(tariffId) {
    try {
      const response = await api.delete(`/tariffs/${tariffId}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при удалении тарифа с ID ${tariffId}:`, error);
      throw error;
    }
  }
}

const tariffService = new TariffService();
export default tariffService;
