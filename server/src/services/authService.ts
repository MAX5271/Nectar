import { authRepository } from "../repository/authRepository.js";
import { sessionRepository } from "../repository/sessionRepository.js";
import { userRepository } from "../repository/userRepository.js";
import { jwtHelper } from "../utils/jwtHelper.js";
import { HttpError } from "../utils/httpError.js";
import StatusCode from "../utils/statusCodes.js";
import { supabaseService } from "./supabaseService.js";

interface LoginData {
  email: string;
  password: string;
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
}

interface SessionMeta {
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

class AuthService {
  // Shared by every way of establishing a session (password login, guest login, signup —
  // see userService.signUp) so token minting/hashing/Session-row creation happens in one place.
  private async issueSession(userId: string, { userAgent, ipAddress }: SessionMeta) {
    const accessToken = jwtHelper.accessTokenGenerator(userId);
    const refreshToken = jwtHelper.refreshTokenGenerator(userId);
    const hashed = jwtHelper.hashToken(refreshToken);

    // Maintain legacy token field
    await authRepository.updateRefreshToken(userId, hashed);

    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await sessionRepository.createSession({
      userId,
      refreshToken: hashed,
      expiresAt,
      userAgent,
      ipAddress,
    });

    return { accessToken, refreshToken };
  }

  async login({ email, password, userAgent, ipAddress }: LoginData) {
    const user = await authRepository.login(email, password);
    const { accessToken, refreshToken } = await this.issueSession(user.id, { userAgent, ipAddress });

    return {
      accessToken,
      refreshToken,
      username: user.username,
      id: user.id,
      email: user.email,
    };
  }

  // Exchanges a Supabase session (anonymous or email/password) for an app session — same
  // shape as login(). Safe to call repeatedly for the same identity: the underlying User
  // row already exists after the first call, so later calls just issue a fresh session.
  async loginWithSupabase(
    supabaseAccessToken: string,
    { userAgent, ipAddress }: SessionMeta,
    initialProfile?: any,
  ) {
    const identity = await supabaseService.verifyToken(supabaseAccessToken);
    const profile = initialProfile || {
      age: identity.userMetadata?.age,
      gender: identity.userMetadata?.gender,
      height: identity.userMetadata?.height,
      weight: identity.userMetadata?.weight,
      unitSystem: identity.userMetadata?.unitSystem,
      planType: identity.userMetadata?.planType,
      preferences: identity.userMetadata?.preferences,
    };
    const user = await userRepository.upsertSupabaseUser({
      id: identity.id,
      email: identity.email,
      username: identity.username,
      profile,
    });
    const { accessToken, refreshToken } = await this.issueSession(user.id, { userAgent, ipAddress });

    return {
      accessToken,
      refreshToken,
      username: user.username,
      id: user.id,
      email: user.email,
    };
  }

  async loginAsGuest(supabaseAccessToken: string, meta: SessionMeta) {
    return this.loginWithSupabase(supabaseAccessToken, meta);
  }

  async refreshToken(token: string) {
    const invalid = new HttpError(
      StatusCode.UNAUTHORIZED,
      "Invalid or expired refresh token",
    );
    let userId: string;
    try {
      userId = (jwtHelper.refreshVerifier(token) as { id: string }).id;
    } catch {
      throw invalid;
    }

    const hashed = jwtHelper.hashToken(token);
    const session = await sessionRepository.findSessionByToken(hashed);

    if (!session) {
      // Token reuse detection: Token is cryptographically valid for this user but not in active sessions.
      // This indicates an old, rotated token is being presented (potential token theft / replay attack).
      await sessionRepository.revokeAllUserSessions(userId);
      await authRepository.updateRefreshToken(userId, null);
      throw new HttpError(
        StatusCode.UNAUTHORIZED,
        "Security alert: Refresh token reuse detected. All sessions revoked.",
      );
    }

    if (session.expiresAt < new Date()) {
      await sessionRepository.deleteSessionByToken(hashed);
      throw invalid;
    }

    // Token Rotation: issue a new refresh token and rotate in place
    const newRefreshToken = jwtHelper.refreshTokenGenerator(userId);
    const newHashed = jwtHelper.hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await sessionRepository.rotateSessionToken(hashed, newHashed, newExpiresAt);
    await authRepository.updateRefreshToken(userId, newHashed);

    return {
      username: session.user.username,
      accessToken: jwtHelper.accessTokenGenerator(session.user.id),
      refreshToken: newRefreshToken,
    };
  }

  // Best-effort: identify the user from the cookie so logout works even when
  // the access token has already expired.
  async logout(token: string | undefined) {
    if (!token) return;
    try {
      const hashed = jwtHelper.hashToken(token);
      await sessionRepository.deleteSessionByToken(hashed);
      const { id } = jwtHelper.refreshVerifier(token) as { id: string };
      await authRepository.updateRefreshToken(id, null);
    } catch {
      // invalid/expired token: nothing to revoke
    }
  }

  async getSessions(userId: string, currentToken?: string | undefined) {
    const sessions = await sessionRepository.getUserSessions(userId);

    if (!currentToken) {
      return sessions.map((s) => ({ ...s, isCurrent: false }));
    }

    // Identify which row belongs to the device making this request, without ever
    // exposing a session's hashed token back to the client.
    const current = await sessionRepository.findSessionByToken(jwtHelper.hashToken(currentToken));
    return sessions.map((s) => ({ ...s, isCurrent: current?.id === s.id }));
  }

  async revokeSession(userId: string, sessionId: string) {
    const deleted = await sessionRepository.deleteSessionById(sessionId, userId);
    if (!deleted) {
      throw new HttpError(StatusCode.NOT_FOUND, "Session not found.");
    }
    return deleted;
  }

  async revokeAllSessions(userId: string) {
    await sessionRepository.revokeAllUserSessions(userId);
    await authRepository.updateRefreshToken(userId, null);
  }
}

export const authService = new AuthService();

