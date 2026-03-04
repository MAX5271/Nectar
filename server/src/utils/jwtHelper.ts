import jwt from 'jsonwebtoken';

const accessSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

if (!accessSecret || !refreshSecret) {
  throw new Error("FATAL ERROR: ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET is not defined.");
}

class JWT {
    accessTokenGenerator(id: string){
        return jwt.sign({id:id},accessSecret as string,{expiresIn:'30m'});
    }
    refreshTokenGenerator(id:string){
        return jwt.sign({id:id},refreshSecret as string,{expiresIn: '7d'});
    }
    refreshVerifier(token:string){
        return jwt.verify(token,refreshSecret as string);
    }
}

export const jwtHelper =  new JWT();