import { authRepository } from "../repository/authRepository.js";
import { userRepository } from "../repository/userRepository.js";
import { jwtHelper } from "../utils/jwtHelper.js";
import type { SignUpData } from "./userService.js";

interface LoginData extends Omit<SignUpData, "username"> {}
interface PayloadToken {
  id: string;
}

class AuthService {
  async login({ email, password }: LoginData) {
    try {
      const result = await authRepository.login(email.trim(), password);
      const accessToken = jwtHelper.accessTokenGenerator(result.id);
      const refreshToken = jwtHelper.refreshTokenGenerator(result.id);
      await authRepository.updateRefreshToken(result.id,refreshToken);
      return {
        accessToken,
        refreshToken,
        username: result.username,
        id: result.id,
      };
    } catch (e) {
      console.log("Error in authService layer ", e);
      throw new Error("Error logging in the user.");
    }
  }

  async refreshToken(token: string,) {
    try {
      const decode = jwtHelper.refreshVerifier(token) as PayloadToken;

      if (!decode) throw new Error("JWT token verification failed.");
      const user = await userRepository.getUserById(decode.id);

      if (user.refreshToken != token) {
        throw new Error("Invalid refresh Token");
      }

      return { username: user.username, accessToken: jwtHelper.accessTokenGenerator(user.id) };

    } catch (error) {
      console.log("Error in authService layer ", error);
      throw new Error("Error in authService layer");
    }
  }
}

export const authService = new AuthService();
