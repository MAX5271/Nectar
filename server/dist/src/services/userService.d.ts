import { type UserRegistrationInput } from "../repository/userRepository.js";
export interface SignUpData extends UserRegistrationInput {
}
declare class UserService {
    signUp(data: SignUpData): Promise<{
        accessToken: string;
        refreshToken: string;
        id: string;
        email: string;
        username: string | null;
        password: string | null;
    }>;
    getUserProfile(userId: string): Promise<{
        id: string;
        email: string;
        username: string | null;
        constraints: {
            id: string;
            height: number;
            weight: number;
            age: number;
            gender: import("@prisma/client").$Enums.Gender;
            planType: import("@prisma/client").$Enums.PlanType;
            unitSystem: import("@prisma/client").$Enums.UnitSystem;
            preferences: string;
            userId: string;
        }[];
    }>;
}
export declare const userService: UserService;
export {};
//# sourceMappingURL=userService.d.ts.map