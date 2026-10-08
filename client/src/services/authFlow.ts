import type { AppDispatch } from '../store/store';
import { setCredentials, logout, setInitialized } from '../store/slices/authSlice';
import { clearDietData } from '../store/slices/dietSlice';
import api from './api';
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Shared by login and registration: fetch the full profile with the fresh
// token, then store both in Redux in-memory state.
export const completeAuth = async (dispatch: AppDispatch, accessToken: string) => {
  const profileResponse = await api.get('/user/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const user = profileResponse.data.data;
  dispatch(setCredentials({ user, token: accessToken }));
  return user;
};

// Initialize authentication on app mount via silent refresh using HttpOnly cookie.
export const initAuthSession = async (dispatch: AppDispatch) => {
  try {
    const res = await axios.post(
      `${baseURL}/auth/refresh`,
      {},
      {
        withCredentials: true,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      },
    );
    const accessToken = res.data.accessToken as string;
    if (accessToken) {
      await completeAuth(dispatch, accessToken);
    } else {
      dispatch(setInitialized(true));
    }
  } catch {
    dispatch(setInitialized(true));
  }
};

// Exchanges a Google token (ID token or access token) for an app session.
export const loginWithGoogleToken = async (dispatch: AppDispatch, idToken: string) => {
  const authResponse = await api.post('/auth/google', { idToken });

  const accessToken = authResponse.data?.data?.accessToken as string | undefined;
  if (!accessToken) {
    throw new Error('Could not establish session.');
  }

  return await completeAuth(dispatch, accessToken);
};

// Starts Google OAuth sign-in flow via Google Identity Services.
export const signInWithGoogle = async (dispatch: AppDispatch) => {
  const { promptGoogleSignIn } = await import('./googleAuth');
  return await promptGoogleSignIn(dispatch);
};

// End local and server session.
export const endSession = async (dispatch: AppDispatch) => {
  try {
    await api.post('/auth/logout');
  } catch {
    // even if the server is unreachable we still log out locally
  }
  dispatch(clearDietData());
  dispatch(logout());
};
