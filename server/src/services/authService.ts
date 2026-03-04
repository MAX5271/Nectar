import { authRepository } from "../repository/authRepository.js";
import { jwtHelper } from "../utils/jwtHelper.js";
import type { SignUpData } from "./userService.js";


interface LoginData extends Omit<SignUpData,"username">{}

class AuthService{
    async login({email,password}:LoginData){
        try{
            const result = await authRepository.login(email.trim(),password);
            const accessToken = jwtHelper.accessTokenGenerator(result.id);
            const refreshToken = jwtHelper.refreshTokenGenerator(result.id);
            return {accessToken,refreshToken,username:result.username,id:result.id};
        }catch(e){
            console.log("Error in authService layer ",e);
            throw new Error("Error logging in the user.");
        }
    }
}

export const authService = new AuthService();