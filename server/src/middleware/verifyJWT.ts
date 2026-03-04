import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            id?: string;
        }
    }
}

interface TokenPayload {
    id: string;
}

class VerifyJWT {
    verifyJWT(req: Request, res: Response, next: NextFunction) {
        const authHeader = (req.headers.authorization || req.headers.Authorization) as string | undefined;
        
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Authorization failed" });
        }
        
        const token = authHeader.split(' ')[1];
    
        if (!token) {
            return res.status(401).json({ message: "Token missing" });
        }
        
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decode) => {
            if (err) return res.sendStatus(403);
            
            const payload = decode as TokenPayload;
            req.id = payload.id;
            
            next();
        });
    }
}

export const verifyJWT = new VerifyJWT();