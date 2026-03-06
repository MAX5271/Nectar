import type { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            id?: string;
        }
    }
}
declare class VerifyJWT {
    verifyJWT(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
}
export declare const verifyJWT: VerifyJWT;
export {};
//# sourceMappingURL=verifyJWT.d.ts.map