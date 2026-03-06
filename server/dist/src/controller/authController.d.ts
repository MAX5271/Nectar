import type { Request, Response } from "express";
declare class AuthController {
    login(req: Request, res: Response): Promise<void>;
    refresh(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
}
export declare const authController: AuthController;
export {};
//# sourceMappingURL=authController.d.ts.map