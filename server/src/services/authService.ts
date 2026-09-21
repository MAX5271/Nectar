import { authRepository } from "../repository/authRepository.js";
import { sessionRepository } from "../repository/sessionRepository.js";
import { jwtHelper } from "../utils/jwtHelper.js";
import { HttpError } from "../utils/httpError.js";
import StatusCode from "../utils/statusCodes.js";

interface LoginData {
  email: string;
  password: string;
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

class AuthService {
  async login({ email, password, userAgent, ipAddress }: LoginData) {
    const user = await authRepository.login(email, password);
    const accessToken = jwtHelper.accessTokenGenerator(user.id);
    const refreshToken = jwtHelper.refreshTokenGenerator(user.id);
    const hashed = jwtHelper.hashToken(refreshToken);

    // Maintain legacy token field
    await authRepository.updateRefreshToken(user.id, hashed);

    // Create session
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await sessionRepository.createSession({
      userId: user.id,
      refreshToken: hashed,
      expiresAt,
      userAgent,
      ipAddress,
    });

    return {
      accessToken,
      refreshToken,
      username: user.username,
      id: user.id,
      email: user.email,
    };
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

  async getSessions(userId: string) {
    return await sessionRepository.getUserSessions(userId);
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

