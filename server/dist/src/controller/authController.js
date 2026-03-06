import { authService } from "../services/authService.js";
import StatusCode from "../utils/statusCodes.js";
class AuthController {
    async login(req, res) {
        {
            try {
                const { email, password } = req.body;
                const { accessToken, refreshToken, username, id } = await authService.login({ email, password });
                if (!id) {
                    res.status(StatusCode.UNAUTHORIZED).json({
                        message: "Invalid email or password.",
                        response: {},
                    });
                    return;
                }
                res.cookie("jwt", refreshToken, {
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    sameSite: "strict",
                    httpOnly: true,
                    secure: true,
                });
                res.status(200).json({
                    success: true,
                    message: "User logged in successfully",
                    data: {
                        id: id,
                        username: username,
                        email: email,
                        accessToken: accessToken,
                    },
                });
            }
            catch (error) {
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                    message: "Internal server error",
                    response: {},
                });
            }
        }
    }
    async refresh(req, res) {
        try {
            const cookie = req.cookies;
            if (!cookie?.jwt) {
                res.status(StatusCode.FORBIDDEN).json({
                    message: "Refresh Token not found",
                    response: {},
                });
                return;
            }
            const result = await authService.refreshToken(cookie.jwt);
            res.json(result);
        }
        catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error",
                response: {},
            });
        }
    }
    async logout(req, res) {
        try {
            const userId = req.id;
            await authService.logout(userId);
            res.clearCookie("jwt", {
                httpOnly: true,
                sameSite: "strict",
                secure: true,
            });
            res.status(StatusCode.SUCCESS).json({
                message: "User successfully logged out",
                response: {},
            });
        }
        catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error",
                response: {},
            });
        }
    }
}
export const authController = new AuthController();
//# sourceMappingURL=authController.js.map