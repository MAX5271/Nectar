import prisma from '../utils/db.js'
import bcrypt from 'bcrypt';

class UserRepository{

    async createUser(
        email: string,
        username: string,
        password: string,
    ){
        const duplicateUser = await prisma.user.findUnique({
            where:{
                email:email
            }
        });
        if(duplicateUser){
            throw new Error("Email already in use.");
        }
        const encryptedPassword = bcrypt.hashSync(password,10);
        const user = await prisma.user.create({
            data:{
                username,
                email,
                password:encryptedPassword
            }
        })
        return user;
    }

    async login(email:string,password:string){
        const user = await prisma.user.findUnique({
            where:{
                email
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

    async getUserById(id: string){
        const user = await prisma.user.findUnique({
            where:{
                id
            }
        });
        if(!user){
            throw new Error("User not found.");
        }
        return user;
    }
}

export const userRepository = new UserRepository();