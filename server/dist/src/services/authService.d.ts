interface LoginData {
    email: string;
    password: string;
}
declare class AuthService {
    login({ email, password }: LoginData): Promise<{
        accessToken: string;
        refreshToken: string;
        username: string | null;
        id: string;
    }>;
    refreshToken(token: string): Promise<{
        username: string | null;
        accessToken: string;
    }>;
    logout(userId: string): Promise<void>;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=authService.d.ts.map