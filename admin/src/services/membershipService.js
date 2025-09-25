import api from '../http/index.js';

class MembershipService {
  // Получить мой активный абонемент
  async getMyActiveMembership() {
    const response = await api.get('/memberships/me/active');
    return response.data;
  }

  // Получить все мои абонементы
  async getAllMyMemberships() {
    const response = await api.get('/memberships/me/all');
    return response.data;
  }

  // Получить мою статистику по абонементам
  async getMyStats() {
    const response = await api.get('/memberships/me/stats');
    return response.data;
  }

  // Создать новый абонемент
  async createMembership(data) {
    const response = await api.post('/memberships', data);
    return response.data;
  }

  // Получить список всех абонементов (для админов/тренеров)
  async getMemberships(params = {}) {
    const response = await api.get('/memberships', { params });
    return response.data;
  }

  // Получить конкретный абонемент по ID
  async getMembershipById(id) {
    const response = await api.get(`/memberships/${id}`);
    return response.data;
  }

  // Обновить абонемент
  async updateMembership(id, data) {
    const response = await api.put(`/memberships/${id}`, data);
    return response.data;
  }

  // Удалить абонемент
  async deleteMembership(id) {
    const response = await api.delete(`/memberships/${id}`);
    return response.data;
  }

  // Получить активный абонемент конкретного пользователя
  async getActiveMembership(userId) {
    const response = await api.get(`/memberships/user/${userId}/active`);
    return response.data;
  }

  // Получить все абонементы конкретного пользователя
  async getUserMemberships(userId) {
    const response = await api.get(`/memberships/user/${userId}`);
    return response.data;
  }

  // Увеличить счетчик использованных посещений
  async incrementUsedVisits(id) {
    const response = await api.post(`/memberships/${id}/visit`);
    return response.data;
  }

  // Получить общую статистику по абонементам (админ/тренер)
  async getStats() {
    const response = await api.get('/memberships/stats');
    return response.data;
  }

  // Обновить просроченные абонементы
  async updateExpiredMemberships() {
    const response = await api.post('/memberships/admin/update-expired');
    return response.data;
  }

  async createMembershipByAdmin(data) {
    const response = await api.post('/memberships/admin/create', data);
    return response.data;
  }
}

const membershipService = new MembershipService();
export default membershipService;
