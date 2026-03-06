import jwt from 'jsonwebtoken';
const accessSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
if (!accessSecret || !refreshSecret) {
    throw new Error("FATAL ERROR: ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET is not defined.");
}
class JWT {
    accessTokenGenerator(id) {
        return jwt.sign({ id: id }, accessSecret, { expiresIn: '30m' });
    }
    refreshTokenGenerator(id) {
        return jwt.sign({ id: id }, refreshSecret, { expiresIn: '7d' });
    }
    refreshVerifier(token) {
        return jwt.verify(token, refreshSecret);
    }
}
export const jwtHelper = new JWT();
//# sourceMappingURL=jwtHelper.js.map