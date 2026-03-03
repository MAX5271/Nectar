import prisma from '../utils/db.js';
import { PlanType,Gender,UnitSystem } from '@prisma/client';

const createUserWithConstraints = async (userData:{
    email: string;
    username: string;
    height: number;
    weight: number;
    gender: Gender;
    unitSystem: UnitSystem;
    preferences: string[];
    planType: PlanType;
    age: number;
}) => {
    return await prisma.user.create({
        data:{
            email: userData.email,
            username: userData.username,
            constraints: {
                create:{
                    height:userData.height,
                    weight:userData.weight,
                    gender:userData.gender,
                    preferences:userData.preferences,
                    planType: userData.planType,
                    unitSystem:userData.unitSystem,
                    age: userData.age
                }
            }
        },
        include:{
            constraints:true
        }
    });
}

module.exports = {
    createUserWithConstraints
}