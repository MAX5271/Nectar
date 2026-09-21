import { authRepository } from "../repository/authRepository.js";
import { userRepository } from "../repository/userRepository.js";
import { jwtHelper } from "../utils/jwtHelper.js";
import { HttpError } from "../utils/httpError.js";
import StatusCode from "../utils/statusCodes.js";

interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  async login({ email, password }: LoginData) {
    const user = await authRepository.login(email, password);
    const accessToken = jwtHelper.accessTokenGenerator(user.id);
    const refreshToken = jwtHelper.refreshTokenGenerator(user.id);
    await authRepository.updateRefreshToken(
      user.id,
      jwtHelper.hashToken(refreshToken),
    );
    return { accessToken, refreshToken, username: user.username, id: user.id, email: user.email };
  }

  async refreshToken(token: string) {
    const invalid = new HttpError(StatusCode.UNAUTHORIZED, "Invalid refresh token");
    let userId: string;
    try {
      userId = (jwtHelper.refreshVerifier(token) as { id: string }).id;
    } catch {
      throw invalid;
    }

    const user = await userRepository.findById(userId);
    if (!user || user.refreshToken !== jwtHelper.hashToken(token)) throw invalid;

    return {
      username: user.username,
      accessToken: jwtHelper.accessTokenGenerator(user.id),
    };
  }

  // Best-effort: identify the user from the cookie so logout works even when
  // the access token has already expired.
  async logout(token: string | undefined) {
    if (!token) return;
    try {
      const { id } = jwtHelper.refreshVerifier(token) as { id: string };
      await authRepository.updateRefreshToken(id, null);
    } catch {
      // invalid/expired token: nothing to revoke
    }
  }
}

export const authService = new AuthService();
