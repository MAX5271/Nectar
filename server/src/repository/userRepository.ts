import type { ActivityLevel, Gender, PlanType, Prisma, UnitSystem } from "@prisma/client";
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
        constraint: { create: { ...biometrics, preferences } },
      },
    });
  }

  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, constraint: true },
    });
    if (!user) return null;
    return {
      ...user,
      constraints: user.constraint ? [user.constraint] : [], // backwards compatibility with client
    };
  }

  async findById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
  }

  async getConstraints(userId: string) {
    return await prisma.dietaryConstraint.findUnique({ where: { userId } });
  }

  async updateUserProfile(
    userId: string,
    data: {
      username?: string | undefined;
      email?: string | undefined;
      planType?: PlanType | undefined;
      gender?: Gender | undefined;
      unitSystem?: UnitSystem | undefined;
      activityLevel?: ActivityLevel | undefined;
      height?: number | undefined;
      weight?: number | undefined;
      age?: number | undefined;
      preferences?: string | undefined;
    },
  ) {
    const { username, email, ...constraintUpdates } = data;

    if (username !== undefined || email !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(username !== undefined && { username }),
          ...(email !== undefined && { email }),
        },
      });
    }

    const updatePayload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(constraintUpdates)) {
      if (value !== undefined) {
        updatePayload[key] = value;
      }
    }

    if (Object.keys(updatePayload).length > 0) {
      await prisma.dietaryConstraint.upsert({
        where: { userId },
        update: updatePayload as Prisma.DietaryConstraintUpdateInput,
        create: {
          userId,
          planType: constraintUpdates.planType ?? "CUTTING",
          gender: constraintUpdates.gender ?? "MALE",
          unitSystem: constraintUpdates.unitSystem ?? "METRIC",
          activityLevel: constraintUpdates.activityLevel ?? "SEDENTARY",
          height: constraintUpdates.height ?? 170,
          weight: constraintUpdates.weight ?? 70,
          age: constraintUpdates.age ?? 25,
          preferences: constraintUpdates.preferences ?? "",
        },
      });
    }

    return await this.getUserProfile(userId);
  }
}

export const userRepository = new UserRepository();

