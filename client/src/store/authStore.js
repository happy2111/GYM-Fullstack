import { makeAutoObservable, runInAction } from 'mobx';
import authService from '../services/authService';

class AuthStore {
  user = null;
  isAuthenticated = false;
  isLoading = false;
  error = null;

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
    try {
      const response = await authService.refreshToken();
      const { accessToken } = response;
      runInAction(() => {
        this.isAuthenticated = true;
        this.isLoading = false;
      });
      localStorage.setItem('token', accessToken);
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


}

const authStore = new AuthStore();
export default authStore;