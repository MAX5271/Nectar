import type { AppDispatch } from '../store/store';
import { setCredentials, logout } from '../store/slices/authSlice';
import { clearDietData } from '../store/slices/dietSlice';
import api from './api';

// shared by login and registration: fetch the full profile with the fresh
// token, then store both in Redux.
export const completeAuth = async (dispatch: AppDispatch, accessToken: string) => {
  const profileResponse = await api.get('/user/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  dispatch(setCredentials({ user: profileResponse.data.data, token: accessToken }));
};

// revoke the refresh token server-side, then wipe local state.
export const endSession = async (dispatch: AppDispatch) => {
  try {
    await api.post('/auth/logout');
  } catch {
    // even if the server is unreachable we still log out locally
  }
  dispatch(clearDietData());
  dispatch(logout());
};
