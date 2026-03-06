import { access } from "node:fs";
import { userService } from "../services/userService.js";
import StatusCode from "../utils/statusCodes.js";
class UserController {
    async signUp(req, res) {
        try {
            const { email, username, password, authProvider, height, weight, age, gender, planType, unitSystem, preferences } = req.body;
            const result = await userService.signUp({
                email, username, password, authProvider, height, weight,
                age, gender, planType, unitSystem, preferences
            });
            res.cookie("jwt", result.refreshToken, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: "strict",
                httpOnly: true,
                secure: true,
            });
            res.status(StatusCode.CREATED).json({
                success: true,
                message: "User created successfully",
                data: {
                    id: result.id,
                    username: result.username,
                    email: result.email,
                    accessToken: result.accessToken,
                },
            });
        }
        catch (error) {
            const status = error.message === "Email already in use." ? StatusCode.CONFLICT : StatusCode.BAD_REQUEST;
            res.status(status).json({
                success: false,
                message: error.message || "An unexpected error occurred",
            });
        }
    }
    async getUserProfile(req, res) {
        try {
            const userId = req.id;
            const result = await userService.getUserProfile(userId);
            res.status(StatusCode.SUCCESS).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(StatusCode.NOT_FOUND).json({
                success: false,
                message: error instanceof Error ? error.message : "User not found",
            });
        }
    }
}
export const userController = new UserController();
//# sourceMappingURL=userController.js.map