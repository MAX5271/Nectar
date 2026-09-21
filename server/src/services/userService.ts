import { userRepository } from "../repository/userRepository.js";
import { authRepository } from "../repository/authRepository.js";
import { jwtHelper } from "../utils/jwtHelper.js";
import { HttpError } from "../utils/httpError.js";
import StatusCode from "../utils/statusCodes.js";
import type { SignUpInput } from "../utils/validation.js";

class UserService {
  async signUp(data: SignUpInput) {
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
    await authRepository.updateRefreshToken(
      user.id,
      jwtHelper.hashToken(refreshToken),
    );
    return { id: user.id, username: user.username, email: user.email, accessToken, refreshToken };
  }

  async getUserProfile(userId: string) {
    const result = await userRepository.getUserProfile(userId);
    if (!result) throw new HttpError(StatusCode.NOT_FOUND, "User not found.");
    return result;
  }
}

export const userService = new UserService();
