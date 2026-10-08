import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exchangeGoogleToken, promptGoogleSignIn } from '../../src/services/googleAuth';
import api from '../../src/services/api';

describe('Google Auth Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exchanges Google token with backend and completes auth', async () => {
    const dispatch = vi.fn();
    const mockPost = vi.spyOn(api, 'post').mockResolvedValue({
      data: {
        success: true,
        data: { accessToken: 'app-jwt-token' },
      },
    } as any);

    const mockGet = vi.spyOn(api, 'get').mockResolvedValue({
      data: {
        success: true,
        data: { id: 'user-1', email: 'test@example.com' },
      },
    } as any);

    const user = await exchangeGoogleToken(dispatch, 'mock-google-id-token');

    expect(mockPost).toHaveBeenCalledWith('/auth/google', { idToken: 'mock-google-id-token' });
    expect(mockGet).toHaveBeenCalledWith('/user/profile', {
      headers: { Authorization: 'Bearer app-jwt-token' },
    });
    expect(user.id).toBe('user-1');
  });

  it('throws an error if client ID is missing when calling promptGoogleSignIn', async () => {
    const dispatch = vi.fn();
    await expect(promptGoogleSignIn(dispatch)).rejects.toThrow(
      'Google OAuth is not configured yet. Please add VITE_GOOGLE_CLIENT_ID in client environment.'
    );
  });
});
