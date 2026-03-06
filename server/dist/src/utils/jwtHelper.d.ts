import jwt from 'jsonwebtoken';
declare class JWT {
    accessTokenGenerator(id: string): string;
    refreshTokenGenerator(id: string): string;
    refreshVerifier(token: string): string | jwt.JwtPayload;
}
export declare const jwtHelper: JWT;
export {};
//# sourceMappingURL=jwtHelper.d.ts.map