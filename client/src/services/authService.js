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
    // Refresh token sent automatically via cookies
    const response = await api.post('/auth/refresh');
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
    const response = await api.get('/auth/profile');
    return response.data;
  }
}

const authService = new AuthService();
export default authService;