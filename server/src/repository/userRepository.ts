import prisma from "../utils/db.js";
import bcrypt from "bcrypt";
import { UnitSystem, Gender, PlanType } from "@prisma/client";

export interface UserRegistrationInput {
  email: string;
  username: string;
  password: string;
  height: number;
  weight: number;
  age: number;
  gender: string;
  planType: string;
  unitSystem: string;
  preferences: string;
}

class UserRepository {
  async createUserWithConstraints(data: UserRegistrationInput) {
    const { email, username, password, ...constraints } = data;

    const normalizedEmail = email.toLowerCase().trim();
    const duplicateUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (duplicateUser) throw new Error("Email already in use.");

    const encryptedPassword = bcrypt.hashSync(password, 10);

    const genderMap: Record<string, Gender> = {
      male: Gender.MALE,
      female: Gender.FEMALE,
    };
    const planMap: Record<string, PlanType> = {
      cutting: PlanType.CUTTING,
      bulking: PlanType.BULKING,
      recomp: PlanType.RECOMP,
    };
    const unitMap: Record<string, UnitSystem> = {
      metric: UnitSystem.METRIC,
      imperial: UnitSystem.IMPERIAL,
    };

    return await prisma.user.create({
      data: {
        email: normalizedEmail,
        username,
        password: encryptedPassword,
        constraints: {
          create: {
            height: constraints.height,
            weight: constraints.weight,
            age: constraints.age,
            preferences: constraints.preferences,
            gender: genderMap[constraints.gender.toLowerCase()] || Gender.MALE,
            planType:
              planMap[constraints.planType.toLowerCase()] || PlanType.RECOMP,
            unitSystem:
              unitMap[constraints.unitSystem.toLowerCase()] ||
              UnitSystem.METRIC,
          },
        },
      },
    });
  }

  async getUserProfile(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        constraints: true,
      },
    });
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) throw new Error("User not found.");
    return user;
  }
}

export const userRepository = new UserRepository();
