'use client';

import axios, { AxiosError, AxiosInstance } from 'axios';
import { toast } from 'sonner';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

let lastNetworkErrorToastTime = 0;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Attach Anti-CSRF Token header if cookie exists
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(new RegExp('(^| )_csrf_token=([^;]+)'));
      if (match && match[2]) {
        config.headers['x-csrf-token'] = match[2];
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<Record<string, unknown>>) => {
    const originalRequest = error.config as any;

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as Record<string, unknown> | undefined;
      let message = typeof data?.message === 'string' ? data.message : '';
      
      if (data && Array.isArray(data.errors) && data.errors.length > 0) {
        const errorDetails = data.errors
          .map((err: { message?: string }) => err.message)
          .filter(Boolean)
          .join(', ');
        if (errorDetails) {
          message = `${message}: ${errorDetails}`;
        }
      }

      if (!message) {
        message = 'An unexpected error occurred. Please try again.';
      }

      // Handle 401 Unauthorized for Refresh Token logic
      if (status === 401 && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password'].includes(currentPath);
        
        // If it's a 401 and we haven't already retried this request
        if (!originalRequest._retry && !isAuthRoute) {
          originalRequest._retry = true;
          
          try {
            // Attempt silent refresh
            await axios.post(`${apiBaseUrl}/auth/refresh`, {}, { withCredentials: true });
            
            // If successful, retry the original request
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, token is actually dead. Log them out.
            window.localStorage.removeItem('auth_user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        } else if (!isAuthRoute) {
            window.localStorage.removeItem('auth_user');
            window.location.href = '/login';
        }
      }

      // Handle 403 Forbidden (Only logout if account is blocked or deactivated)
      if (status === 403 && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password'].includes(currentPath);
        
        if (data?.requiresVerification) {
          // Do not redirect to login, let the component handle it (e.g. redirect to /register)
        } else if (!isAuthRoute) {
          const lowerMsg = message.toLowerCase();
          const isAccountStateError = lowerMsg.includes('deactivated') || lowerMsg.includes('blocked');

          if (isAccountStateError) {
            toast.error(message || 'Your account has been deactivated by an administrator.');
            window.localStorage.removeItem('auth_user');
            window.location.href = '/login';
          } else {
            toast.error(message || 'You do not have permission to perform this action.');
          }
        }
      }

      const normalizedError = new Error(message);
      Object.assign(normalizedError, { status, response: error.response });
      return Promise.reject(normalizedError);
    }

    if (error.request) {
      const now = Date.now();
      if (now - lastNetworkErrorToastTime > 5000) { // Throttle to 5 seconds
        toast.error('Network error. Server might be down or unreachable.');
        lastNetworkErrorToastTime = now;
      }
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    return Promise.reject(new Error(error.message));
  }
);

export default axiosInstance;
