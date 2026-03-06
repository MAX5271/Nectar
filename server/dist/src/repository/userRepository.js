import prisma from "../utils/db.js";
import bcrypt from "bcrypt";
import { UnitSystem, Gender, PlanType } from "@prisma/client";
class UserRepository {
    async createUserWithConstraints(data) {
        const { email, username, password, authProvider, ...constraints } = data;
        const normalizedEmail = email.toLowerCase().trim();
        const duplicateUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (duplicateUser)
            throw new Error("Email already in use.");
        let finalPassword = null;
        if (authProvider === 'local' && password) {
            finalPassword = await bcrypt.hash(password, 10);
        }
        const genderMap = {
            male: Gender.MALE,
            female: Gender.FEMALE,
        };
        const planMap = {
            cutting: PlanType.CUTTING,
            bulking: PlanType.BULKING,
            recomp: PlanType.RECOMP,
        };
        const unitMap = {
            metric: UnitSystem.METRIC,
            imperial: UnitSystem.IMPERIAL,
        };
        return await prisma.user.create({
            data: {
                email: normalizedEmail,
                username,
                password: finalPassword,
                constraints: {
                    create: {
                        height: Number(constraints.height),
                        weight: Number(constraints.weight),
                        age: Number(constraints.age),
                        preferences: constraints.preferences,
                        gender: genderMap[constraints.gender.toLowerCase()] || Gender.MALE,
                        planType: planMap[constraints.planType.toLowerCase()] || PlanType.RECOMP,
                        unitSystem: unitMap[constraints.unitSystem.toLowerCase()] || UnitSystem.METRIC,
                    },
                },
            },
        });
    }
    async getUserProfile(userId) {
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
    async getUserById(id) {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        if (!user)
            throw new Error("User not found.");
        return user;
    }
}
export const userRepository = new UserRepository();
//# sourceMappingURL=userRepository.js.map