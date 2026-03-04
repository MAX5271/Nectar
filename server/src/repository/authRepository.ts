import prisma from '../utils/db.js'
import bcrypt from 'bcrypt'

class AuthRepository {
    async login(email:string,password:string){
            const user = await prisma.user.findUnique({
                where:{
                    email: email.toLowerCase()
                }
            });
            if(!user){
                throw new Error("User not found.");
            }
            if(!bcrypt.compareSync(password,user.password)){
                throw new Error("Invalid Password");
            }
            return user;
        }
}

export const authRepository = new AuthRepository();