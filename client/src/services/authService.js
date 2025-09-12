import api from '../http';

class AuthService {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  async checkEmail(email) {
    const response = await api.post('/auth/check-email', { email });
    return response.data;
  }

  async refreshToken() {
    const response = await api.post("/auth/refresh");
    return response.data;
  }

  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  }

  async logout() {
    // This will also clear the refresh token cookie on the server
    const response = await api.post('/auth/logout');
    return response.data;
  }

  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  async getSessions() {
    const response = await api.get('/auth/sessions');
    return response.data;
  }

  async revokeSession(sessionId) {
    const response = await api.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  }

  async telegramAuth(initData) {
    console.log("Telegram initData telegramAuth:", initData);
    const response = await api.post("/auth/telegram", initData, {
      withCredentials: true,
    });

    console.log("Telegram auth response:", response);

    return response.data;
  }

}

const authService = new AuthService();
export default authService;