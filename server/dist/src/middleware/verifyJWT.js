import jwt from 'jsonwebtoken';
class VerifyJWT {
    verifyJWT(req, res, next) {
        const authHeader = (req.headers.authorization || req.headers.Authorization);
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Authorization failed" });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Token missing" });
        }
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
            if (err)
                return res.sendStatus(403);
            const payload = decode;
            req.id = payload.id;
            next();
        });
    }
}
export const verifyJWT = new VerifyJWT();
//# sourceMappingURL=verifyJWT.js.map