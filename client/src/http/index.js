import axios from 'axios';
import toast from "react-hot-toast";
import i18n from '../i18n'; // путь к твоему i18n конфигу


const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for refresh token
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;


    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token is sent automatically via cookies
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true // Include cookies in refresh request
        });

        const { accessToken } = response.data;
        localStorage.setItem('token', accessToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear localStorage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      console.error('Network or CORS error:', error);
      toast.error('Проблема с сетью или CORS');
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (error.response.status === 429) {
      console.warn('429 Too Many Requests');
      toast.error(i18n.t('errors.tooManyRequests'));
    }

    return Promise.reject(error);
  }
);

export default api;