export interface UserRegistrationInput {
    email: string;
    username: string;
    password: string;
    authProvider: 'local' | 'google';
    height: number;
    weight: number;
    age: number;
    gender: string;
    planType: string;
    unitSystem: string;
    preferences: string;
}
declare class UserRepository {
    createUserWithConstraints(data: UserRegistrationInput): Promise<{
        id: string;
        email: string;
        username: string | null;
        password: string | null;
        refreshToken: string | null;
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
    } | null>;
    getUserById(id: string): Promise<{
        id: string;
        email: string;
        username: string | null;
        password: string | null;
        refreshToken: string | null;
    }>;
}
export declare const userRepository: UserRepository;
export {};
//# sourceMappingURL=userRepository.d.ts.map