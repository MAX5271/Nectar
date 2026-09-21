import prisma from "../utils/db.js";
import bcrypt from "bcrypt";
import type { SignUpInput } from "../utils/validation.js";

class UserRepository {
  async createUserWithConstraints(data: SignUpInput) {
    const { email, username, password, preferences, ...biometrics } = data;
    const duplicate = await prisma.user.findUnique({ where: { email } });
    if (duplicate) throw new Error("Email already in use.");

    // A concurrent duplicate still fails on the unique index (handled as 409).
    return await prisma.user.create({
      data: {
        email,
        username,
        password: await bcrypt.hash(password, 10),
        constraints: { create: { ...biometrics, preferences } },
      },
    });
  }

  async getUserProfile(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, constraints: true },
    });
  }

  async findById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
  }

  async getConstraints(userId: string) {
    return await prisma.dietaryConstraint.findFirst({ where: { userId } });
  }
}

export const userRepository = new UserRepository();
