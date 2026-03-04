import { dietService } from "../services/dietService.js";
import type { Response,Request } from "express";

class DietController{
    async dietPlan(req:Request,res:Response){
        try{
            const userId = "1ea3b380-1817-4af6-8b2f-b04460aff65d";
            const result = await dietService.dietResponse(userId as string);
            res.status(200).json({
                result:result
            })
        }catch(e){
            console.log(e);
        }
    }
}

export const dietController = new DietController();