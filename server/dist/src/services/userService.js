import { userRepository, } from "../repository/userRepository.js";
import { jwtHelper } from "../utils/jwtHelper.js";
class UserService {
    async signUp(data) {
        try {
            const { email, username, password, authProvider, height, weight, age, gender, planType, unitSystem, } = data;
            if (!email ||
                !username ||
                !height ||
                !weight ||
                !age ||
                !gender ||
                !planType ||
                !unitSystem) {
                throw new Error("Core identification and biometric fields are required.");
            }
            if (authProvider === "local" && !password) {
                throw new Error("Password is required for local authentication protocols.");
            }
            const result = await userRepository.createUserWithConstraints(data);
            const accessToken = jwtHelper.accessTokenGenerator(result.id);
            const refreshToken = jwtHelper.refreshTokenGenerator(result.id);
            return { ...result, accessToken, refreshToken };
        }
        catch (e) {
            console.log("Error in userService layer ", e);
            throw new Error(e.message || "Error creating the user.");
        }
    }
    async getUserProfile(userId) {
        try {
            const result = await userRepository.getUserProfile(userId);
            if (!result)
                throw new Error("User not found.");
            return result;
        }
        catch (e) {
            console.log("Error in userService layer ", e);
            throw new Error("Error fetching the user profile.");
        }
    }
}
export const userService = new UserService();
//# sourceMappingURL=userService.js.map