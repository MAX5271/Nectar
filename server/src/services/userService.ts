import { userRepository } from "../repository/userRepository.js";

export interface SignUpData{
    email: string;
    username: string;
    password: string;
}

class UserService{
    async signUp({email,username,password}:SignUpData){
        try{
            if(!email||!username||!password){
                throw new Error("All fields are required.");
            }
            const result = await userRepository.createUser(email,username,password);
            if(!result){
                
            }
            return result;
        }catch(e){
            console.log("Error in userService layer ",e);
            throw new Error("Error creating the user.")
        }
    }

}

export const userService = new UserService();