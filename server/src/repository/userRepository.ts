import type { ActivityLevel, Gender, PlanType, Prisma, UnitSystem } from "@prisma/client";
import prisma from "../utils/db.js";
import bcrypt from "bcrypt";
import type { SignUpInput } from "../utils/validation.js";

class UserRepository {
  // Creates a bare User row for a guest, keyed to the Supabase identity's own id so no
  // separate linking column is needed. Idempotent: a returning guest just re-fetches.
  async upsertGuestUser(supabaseUserId: string) {
    return await prisma.user.upsert({
      where: { id: supabaseUserId },
      update: {},
      create: {
        id: supabaseUserId,
        username: `Guest ${supabaseUserId.slice(0, 4)}`,
        email: null,
        password: null,
      },
    });
  }

  async upsertSupabaseUser({
    id,
    email,
    username,
    profile,
  }: {
    id: string;
    email: string | null;
    username?: string | null | undefined;
    profile?: any;
  }) {
    // 1. Check if user already exists by Supabase ID
    const existingById = await prisma.user.findUnique({
      where: { id },
      include: { constraint: true },
    });

    if (existingById) {
      const updates: Prisma.UserUpdateInput = {};
      if (email && existingById.email !== email) updates.email = email;
      if (username && !existingById.username) updates.username = username;

      const user = Object.keys(updates).length > 0
        ? await prisma.user.update({ where: { id }, data: updates })
        : existingById;

      if (profile && !existingById.constraint && profile.age && profile.height && profile.weight) {
        const { preferences = "", ...biometrics } = profile;
        await prisma.dietaryConstraint.create({
          data: {
            userId: id,
            preferences: preferences || "",
            ...biometrics,
          },
        });
      }

      return user;
    }

    // 2. Check if an existing account has this email (e.g. from previous local signup)
    if (email) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email },
        include: { constraint: true },
      });
      if (existingByEmail) {
        return existingByEmail;
      }
    }

    // 3. Create fresh user row
    const initialUsername: string | null = (username ?? (email ? email.split("@")[0] : `User ${id.slice(0, 4)}`)) ?? null;
    const createData: Prisma.UserCreateInput = {
      id,
      email,
      username: initialUsername,
    };

    if (profile && profile.age && profile.height && profile.weight) {
      const { preferences = "", ...biometrics } = profile;
      createData.constraint = {
        create: {
          preferences: preferences || "",
          ...biometrics,
        },
      };
    }

    return await prisma.user.create({ data: createData });
  }

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

