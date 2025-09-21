import api from '../http';

class VisitService {
  async scanQR(qrCode , note = null) {
    const response = await api.post('/visits/scan', { qrCode, note });
    return response.data;
  }

  /**
   * Получить список посещений (для админки/тренеров или своих)
   * @param {Object} params
   * @param {number} params.page - текущая страница (по умолчанию 1)
   * @param {number} params.limit - количество записей на странице (по умолчанию 20)
   * @param {string} params.userId - фильтр по пользователю (только для админов/тренеров)
   * @param {string} params.membershipId - фильтр по абонементу
   * @param {string} params.checkinMethod - способ входа (qr/admin)
   * @param {string} params.dateFrom - дата начала периода
   * @param {string} params.dateTo - дата конца периода
   * @param {string} params.userName - поиск по имени пользователя
   * @param {boolean} params.today - только за сегодня
   */
  async getVisits({
                    page = 1,
                    limit = 20,
                    userId,
                    membershipId,
                    checkinMethod,
                    dateFrom,
                    dateTo,
                    userName,
                    today,
                  } = {}) {
    try {
      const response = await api.get("/visits", {
        params: {
          page,
          limit,
          ...(userId && { user_id: userId }),
          ...(membershipId && { membership_id: membershipId }),
          ...(checkinMethod && { checkin_method: checkinMethod }),
          ...(dateFrom && { date_from: dateFrom }),
          ...(dateTo && { date_to: dateTo }),
          ...(userName && { user_name: userName }),
          ...(today && { today }),
        },
      });

      console.log("getVisits response:", response.data.data );

      return {
        visits: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("Ошибка при получении посещений:", error);
      throw error;
    }
  }

  /**
   * Получить мои посещения
   */
  async getMyVisits({ page = 1, limit = 20, dateFrom, dateTo } = {}) {
    try {
      const response = await api.get("/visits/me", {
        params: { page, limit, date_from: dateFrom, date_to: dateTo },
      });

      return {
        visits: response.data.visits,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("Ошибка при получении моих посещений:", error);
      throw error;
    }
  }

  /**
   * Получить одно посещение
   */
  async getVisitById(id) {
    try {
      const response = await api.get(`/visits/${id}`);
      return response.data.visit;
    } catch (error) {
      console.error("Ошибка при получении посещения:", error);
      throw error;
    }
  }

  /**
   * Создать ручное посещение (только админ)
   */
  async createManualVisit({ userId, membershipId, notes }) {
    try {
      const response = await api.post("/visits/manual", {
        userId,
        membershipId,
        notes,
      });

      return response.data;
    } catch (error) {
      console.error("Ошибка при создании ручного посещения:", error);
      throw error;
    }
  }

  /**
   * Удалить посещение (только админ)
   */
  async deleteVisit(id) {
    try {
      const response = await api.delete(`/visits/${id}`);
      return response.data;
    } catch (error) {
      console.error("Ошибка при удалении посещения:", error);
      throw error;
    }
  }

  /**
   * Обновить посещение (только админ)
   */
  async updateVisit(id, updateData) {
    try {
      const response = await api.put(`/visits/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error("Ошибка при обновлении посещения:", error);
      throw error;
    }
  }


}

const visitService = new VisitService();
export default visitService;