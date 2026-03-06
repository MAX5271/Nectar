import type { Request, Response } from "express";
declare class UserController {
    signUp(req: Request, res: Response): Promise<void>;
    getUserProfile(req: Request, res: Response): Promise<void>;
}
export declare const userController: UserController;
export {};
//# sourceMappingURL=userController.d.ts.map