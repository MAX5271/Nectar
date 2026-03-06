import axios from 'axios';
import { type Store } from '@reduxjs/toolkit';
import { setCredentials, logout } from '../store/slices/authSlice';

// we cannot import the 'store' directly here, or the app will crash on boot.
// we declare a variable and inject the store later from our main file.
let store: Store;

export const injectStore = (_store: Store) => {
  store = _store;
};

const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
  
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

api.interceptors.response.use(
    //for success, 200 range reponses
    //for failure, 400 and 500 range responses
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // mark as retried to prevent infinite loops

      try {
        
        const refreshResponse = await axios.post(
          'http://localhost:5000/api/auth/refresh', 
          {}, 
          { withCredentials: true }//if no withCredentials here, the browser won't send the HttpOnly cookie
        );
        
        const newToken = refreshResponse.data.accessToken;

        store.dispatch(setCredentials({ 
          user: store.getState().auth.user, 
          token: newToken 
        }));

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        console.error('[SYSTEM] Invalid refresh token.');
        // if the refresh also fails, it means the user needs to log in again.
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;