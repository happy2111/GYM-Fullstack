import { makeAutoObservable, runInAction } from 'mobx';
import authService from '../services/authService';

class AuthStore {
  user = null;
  isAuthenticated = false;
  isLoading = false;
  error = null;
  sessions = [];


  constructor() {
    makeAutoObservable(this);
    this.initializeAuth();
  }

  initializeAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        this.user = JSON.parse(user);
        this.isAuthenticated = true;
      } catch (error) {
        this.logout();
      }
    }
  }

  async login(credentials) {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await authService.login(credentials);

      runInAction(() => {
        this.user = response.user;
        this.isAuthenticated = true;
        this.isLoading = false;
      });

      // Store access token in localStorage, refresh token handled by cookie
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      return response;
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Login failed';
        this.isLoading = false;
      });
      throw error;
    }
  }

  async register(userData) {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await authService.register(userData);

      runInAction(() => {
        this.user = response.user;
        this.isAuthenticated = true;
        this.isLoading = false;
      });

      // Store access token in localStorage, refresh token handled by cookie
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      return response;
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Registration failed';
        this.isLoading = false;
      });
      throw error;
    }
  }

  async checkEmail(email) {
    try {
      const response = await authService.checkEmail(email);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userData) {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await authService.updateProfile(userData);

      runInAction(() => {
        this.user = { ...this.user, ...response.user };
        this.isLoading = false;
      });

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(this.user));

      return response;
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Update failed';
        this.isLoading = false;
      });
      throw error;
    }
  }

  async refreshToken(){
    this.isLoading = true;
    this.error = null;
    try {
      const response = await authService.refreshToken();
      const { accessToken, user } = response;
      runInAction(() => {
        this.isAuthenticated = true;
        this.isLoading = false;
        this.user = user;
      });
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
    }catch (error) {
      console.error(error);
    }
  }

  async getMe () {
    this.isLoading = true;
    this.error = null;
    try {
      const response = authService.getProfile();
      runInAction(() => {
        this.user = { ...this.user, ...response.user };
        this.isLoading = false;
      });
      return response;
    }catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'get me failed';
        this.isLoading = false;
      });
      throw error;
    }
  }

  logout() {
    runInAction(() => {
      this.user = null;
      this.isAuthenticated = false;
      this.isLoading = false;
      this.error = null;
    });

    // Clear localStorage only (cookies cleared by server)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  clearError() {
    this.error = null;
  }

  async getSessions() {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await authService.getSessions();
      runInAction(() => {
        this.sessions = response.sessions; // допустим, backend возвращает { sessions: [...] }
        this.isLoading = false;
      });
      return response;
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to fetch sessions';
        this.isLoading = false;
      });
      throw error;
    }
  }

  async revokeSession(sessionId) {
    try {
      const response = await authService.revokeSession(sessionId);

      if (response.logout) {
        // сам себя удалил → выходим
        runInAction(() => {
          this.user = null;
          this.isAuthenticated = false;
          this.sessions = [];
        });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } else {
        runInAction(() => {
          this.sessions = this.sessions.filter(s => s.id !== sessionId);
        });
      }
    } catch (error) {
      this.error = error.response?.data?.message || "Failed to revoke session";
      throw error;
    }
  }

  async telegramLogin() {
    this.isLoading = true;
    this.error = null;

    try {
      const tg = window.Telegram.WebApp;
      tg.ready();

      const initData = tg.initDataUnsafe;
      if (!initData?.user) {
        throw new Error("Нет данных Telegram пользователя");
      }

      const response = await authService.telegramAuth({
        telegramId: initData.user.id,
        firstName: initData.user.first_name,
        lastName: initData.user.last_name,
        photoUrl: initData.user.photo_url || null,
        username: initData.user.username || null,
      });

      runInAction(() => {
        this.user = response.user;
        this.isAuthenticated = true;
        this.isLoading = false;
      });

      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("user", JSON.stringify(response.user));

      return response;
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || "Telegram login failed";
        this.isLoading = false;
      });
      throw error;
    }
  }


}

const authStore = new AuthStore();
export default authStore;