import { userRepository } from "../repository/userRepository.js";
import { authRepository } from "../repository/authRepository.js";
import { sessionRepository } from "../repository/sessionRepository.js";
import { jwtHelper } from "../utils/jwtHelper.js";
import { HttpError } from "../utils/httpError.js";
import StatusCode from "../utils/statusCodes.js";
import type { SignUpInput, UpdateProfileInput } from "../utils/validation.js";
import { validateAgeSafety } from "../utils/safetyGuardrails.js";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

class UserService {
  async signUp(
    data: SignUpInput,
    meta?: { userAgent?: string | undefined; ipAddress?: string | undefined },
  ) {
    let user;
    try {
      user = await userRepository.createUserWithConstraints(data);
    } catch (e) {
      if (e instanceof Error && e.message === "Email already in use.") {
        throw new HttpError(StatusCode.CONFLICT, e.message);
      }
      throw e;
    }
    const accessToken = jwtHelper.accessTokenGenerator(user.id);
    const refreshToken = jwtHelper.refreshTokenGenerator(user.id);
    const hashed = jwtHelper.hashToken(refreshToken);

    await authRepository.updateRefreshToken(user.id, hashed);

    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await sessionRepository.createSession({
      userId: user.id,
      refreshToken: hashed,
      expiresAt,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    return { id: user.id, username: user.username, email: user.email, accessToken, refreshToken };
  }

  async getUserProfile(userId: string) {
    const result = await userRepository.getUserProfile(userId);
    if (!result) throw new HttpError(StatusCode.NOT_FOUND, "User not found.");
    return result;
  }

  async updateUserProfile(userId: string, data: UpdateProfileInput) {
    if (data.age !== undefined) {
      const ageCheck = validateAgeSafety(data.age);
      if (!ageCheck.allowed) {
        throw new HttpError(StatusCode.BAD_REQUEST, ageCheck.error!);
      }
    }
    const updated = await userRepository.updateUserProfile(userId, data);
    if (!updated) throw new HttpError(StatusCode.NOT_FOUND, "User not found.");
    return updated;
  }
}

export const userService = new UserService();

