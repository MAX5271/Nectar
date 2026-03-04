import {authService} from '../services/authService.js'
import  type {Request, Response } from 'express'

class AuthController{
    async login(req:Request,res:Response){
        try {
            const {email,password} = req.body;
            const {accessToken,refreshToken,username,id} = await authService.login({email,password});
            if(!id){
                return res.status(403).json({
                    "message":"Invalid email or password.",
                    "response":{}
                });
            }
            res.cookie("jwt",refreshToken,{
                maxAge:7*24*60*60*1000,
                sameSite: 'strict',
                httpOnly: true,
                secure: true
            });
            return res.status(200).json({
                "message":"User successfully logged-in",
                "response":{
                    accessToken,
                    username,
                    email,
                    id
                }
            });
        } catch (error) {
            res.status(404).json({
                "message":"Internal server error",
                response:{}
            });
        }
    }

    async refresh(req:Request,res:Response){
        try {
            const cookie = req.cookies;
            if(!cookie?.jwt) return res.status(403).json({
                    "message":"Refresh Token not found",
                    "response":{}
                });
            
            const result = await authService.refreshToken(cookie.jwt);
            return res.json(result);
                
        } catch (error) {
            res.status(404).json({
                "message":"Internal server error",
                response:{}
            });
        }
    }
}

export const authController = new AuthController();