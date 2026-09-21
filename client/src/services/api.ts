import axios from 'axios';
import { type Store } from '@reduxjs/toolkit';
import { setCredentials, logout } from '../store/slices/authSlice';

// we cannot import the 'store' directly here, or the app will crash on boot.
// we declare a variable and inject the store later from our main file.
let store: Store;

export const injectStore = (_store: Store) => {
  store = _store;
};

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// before ANY request leaves the browser, this runs.
api.interceptors.request.use((config) => {
  const token = store?.getState().auth.token;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// all requests that hit a 401 at the same time share ONE refresh call.
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = (): Promise<string> => {
  if (!refreshPromise) {
    // bare axios (not `api`) so this call can't recurse through the interceptor.
    refreshPromise = axios
      .post(
        `${baseURL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
        },
      )
      .then((res) => res.data.accessToken as string)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true; // mark as retried to prevent infinite loops

      try {
        const newToken = await refreshAccessToken();

        store.dispatch(
          setCredentials({
            user: store.getState().auth.user,
            token: newToken,
          }),
        );

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // the refresh failed too, so the user needs to log in again.
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
