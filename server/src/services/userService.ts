import {
  userRepository,
  type UserRegistrationInput,
} from "../repository/userRepository.js";

export interface SignUpData extends UserRegistrationInput {}

class UserService {
  async signUp(data: SignUpData) {
    try {
      const {
        email,
        username,
        password,
        height,
        weight,
        age,
        gender,
        planType,
        unitSystem,
      } = data;

      if (
        !email ||
        !username ||
        !password ||
        !height ||
        !weight ||
        !age ||
        !gender ||
        !planType ||
        !unitSystem
      ) {
        throw new Error("All fields are required.");
      }

      const result = await userRepository.createUserWithConstraints(data);
      return result;
    } catch (e: any) {
      console.log("Error in userService layer ", e);
      throw new Error(e.message || "Error creating the user.");
    }
  }

  async getUserProfile(userId: string) {
    try {
      const result = await userRepository.getUserProfile(userId);
      if (!result) throw new Error("User not found.");
      return result;
    } catch (e) {
      console.log("Error in userService layer ", e);
      throw new Error("Error fetching the user profile.");
    }
  }
}

export const userService = new UserService();
