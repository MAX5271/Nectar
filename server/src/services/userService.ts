import { userRepository } from "../repository/userRepository.js";

interface SignUpData{
    email: string;
    username: string;
    password: string;
}

interface LoginData extends Omit<SignUpData,"username">{}

class UserService{
    async signUp({email,username,password}:SignUpData){
        if(!email||!username||!password){
            throw new Error("All fields are required.");
        }
        const result = await userRepository.createUser(email,username,password);
        return result;
    }

}

export const userService = new UserService();