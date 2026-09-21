import prisma from "../utils/db.js";
import bcrypt from "bcrypt";
import { HttpError } from "../utils/httpError.js";
import StatusCode from "../utils/statusCodes.js";

class AuthRepository {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Same error for unknown email and wrong password so we don't leak which exist.
    const valid = user?.password
      ? await bcrypt.compare(password, user.password)
      : false;
    if (!user || !valid) {
      throw new HttpError(StatusCode.UNAUTHORIZED, "Invalid email or password.");
    }
    return user;
  }

  async updateRefreshToken(id: string, tokenHash: string | null) {
    await prisma.user.update({
      where: { id },
      data: { refreshToken: tokenHash },
    });
  }
}

export const authRepository = new AuthRepository();
