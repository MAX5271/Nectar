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

  dispatch(setCredentials({ user: profileResponse.data.data, token: accessToken }));
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

// Exchanges a Supabase session (anonymous, email/password, or OAuth) for an app session.
export const syncSupabaseSession = async (
  dispatch: AppDispatch,
  supabaseAccessToken: string,
  profile?: any,
) => {
  const authResponse = await api.post('/auth/supabase-session', {
    supabaseAccessToken,
    profile,
  });

  const accessToken = authResponse.data?.data?.accessToken as string | undefined;
  if (!accessToken) {
    throw new Error('Could not establish session.');
  }

  await completeAuth(dispatch, accessToken);
};

// Starts (or resumes) a Supabase anonymous session, then exchanges it for a normal
// app session via the existing login machinery — completeAuth() below is what every
// other auth path already uses, so a guest session behaves identically everywhere else.
export const continueAsGuest = async (dispatch: AppDispatch) => {
  const { supabase } = await import('./supabaseClient');
  if (!supabase) {
    throw new Error('Guest sign-in is not available right now.');
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.session) {
    throw error ?? new Error('Could not start a guest session.');
  }

  await syncSupabaseSession(dispatch, data.session.access_token);
};

// Revoke the refresh token server-side, clear Supabase session, then wipe local state.
export const endSession = async (dispatch: AppDispatch) => {
  try {
    const { supabase } = await import('./supabaseClient');
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch {
    // Best-effort
  }

  try {
    await api.post('/auth/logout');
  } catch {
    // even if the server is unreachable we still log out locally
  }
  dispatch(clearDietData());
  dispatch(logout());
};
