import prisma from "../utils/db.js";
import bcrypt from "bcrypt";

class AuthRepository {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
    if (!user) {
      throw new Error("User not found.");
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new Error("Invalid Password");
    }
    return user;
  }
  async updateRefreshToken(id: string, token: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) throw new Error("User not found");
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        refreshToken: token,
      },
    });
  }
  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}

export const authRepository = new AuthRepository();
