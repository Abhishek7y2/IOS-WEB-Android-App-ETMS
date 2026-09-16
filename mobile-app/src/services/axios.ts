import axios, { AxiosInstance } from 'axios';
import { safeStorage } from './storage';
import { API_BASE_URL } from '../config/api';

export const TOKEN_STORAGE_KEY = 'auth_token_mobile';
export const USER_STORAGE_KEY = 'auth_user_mobile';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await safeStorage.getItem(TOKEN_STORAGE_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Storage read error fallback
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Server error occurred.';

      if (status === 401 || (status === 403 && (message.toLowerCase().includes('blocked') || message.toLowerCase().includes('deactivated')))) {
        try {
          await safeStorage.removeItem(TOKEN_STORAGE_KEY);
          await safeStorage.removeItem(USER_STORAGE_KEY);
        } catch {}
      }

      const normalizedError = new Error(message);
      Object.assign(normalizedError, { status, response: error.response });
      return Promise.reject(normalizedError);
    }
    if (error.request) {
      return Promise.reject(new Error('Network error. Unable to connect to backend server.'));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
