declare class AuthRepository {
    login(email: string, password: string): Promise<{
        id: string;
        email: string;
        username: string | null;
        password: string | null;
        refreshToken: string | null;
    }>;
    updateRefreshToken(id: string, token: string): Promise<void>;
    logout(userId: string): Promise<void>;
}
export declare const authRepository: AuthRepository;
export {};
//# sourceMappingURL=authRepository.d.ts.map