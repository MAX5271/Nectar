import api from './api';
import { completeAuth } from './authFlow';
import type { AppDispatch } from '../store/store';

declare global {
  interface Window {
    google?: any;
  }
}

export const getGoogleClientId = (): string => {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
};

export const isGoogleAuthConfigured = (): boolean => {
  return Boolean(getGoogleClientId());
};

/**
 * Dynamically loads the official Google Identity Services SDK script if not already present.
 */
export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if (window.google?.accounts) return resolve();

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In SDK')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Sign-In SDK'));
    document.head.appendChild(script);
  });
};

/**
 * Sends a verified Google token to our backend API to exchange for a Nectar session.
 */
export const exchangeGoogleToken = async (dispatch: AppDispatch, idToken: string) => {
  const response = await api.post('/auth/google', { idToken });
  const accessToken = response.data?.data?.accessToken as string | undefined;
  if (!accessToken) {
    throw new Error('Could not establish session.');
  }

  return await completeAuth(dispatch, accessToken);
};

/**
 * Initiates the Google Sign-In popup flow via Google Identity Services.
 */
export const promptGoogleSignIn = async (dispatch: AppDispatch): Promise<any> => {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Google OAuth is not configured yet. Please add VITE_GOOGLE_CLIENT_ID in client environment.');
  }

  await loadGoogleScript();

  if (!window.google?.accounts?.oauth2 && !window.google?.accounts?.id) {
    throw new Error('Google Sign-In SDK is not available.');
  }

  return new Promise((resolve, reject) => {
    try {
      if (window.google.accounts.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: async (response: any) => {
            if (response.error) {
              reject(new Error(response.error_description || response.error));
              return;
            }
            if (!response.access_token) {
              reject(new Error('No token received from Google.'));
              return;
            }
            try {
              const user = await exchangeGoogleToken(dispatch, response.access_token);
              resolve(user);
            } catch (err) {
              reject(err);
            }
          },
        });
        client.requestAccessToken();
      } else {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (!response.credential) {
              reject(new Error('No credential received from Google.'));
              return;
            }
            try {
              const user = await exchangeGoogleToken(dispatch, response.credential);
              resolve(user);
            } catch (err) {
              reject(err);
            }
          },
        });
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('Google Sign-In prompt was closed or skipped.'));
          }
        });
      }
    } catch (err) {
      reject(err);
    }
  });
};
