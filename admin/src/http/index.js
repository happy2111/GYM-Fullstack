import axios from 'axios';
import toast from "react-hot-toast";
import i18n from '../i18n';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      console.error('Network or CORS error:', error);
      toast.error(i18n.t('errors.network') || 'Проблема с сетью или CORS');
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const status = error.response.status;

    // 🔄 401 Unauthorized → пробуем рефреш
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });

        const { accessToken } = response.data;
        localStorage.setItem('token', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 🚫 403 Forbidden
    if (status === 403) {
      toast.error(i18n.t('errors.forbidden') || 'У вас нет доступа');
      // Можно редиректить на главную или логин
      // window.location.href = '/';
    }

    // ⏳ 429 Too Many Requests
    if (status === 429) {
      console.warn('429 Too Many Requests');
      toast.error(i18n.t('errors.tooManyRequests') || 'Слишком много запросов. Попробуйте позже.');
    }

    return Promise.reject(error);
  }
);

export default api;
