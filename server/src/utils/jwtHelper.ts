import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const accessSecret = config.ACCESS_TOKEN_SECRET;
const refreshSecret = config.REFRESH_TOKEN_SECRET;

class JWT {
  accessTokenGenerator(id: string) {
    const jti = crypto.randomUUID();
    return jwt.sign({ id, jti }, accessSecret as string, { expiresIn: "30m" });
  }
  refreshTokenGenerator(id: string) {
    const jti = crypto.randomUUID();
    return jwt.sign({ id, jti }, refreshSecret as string, { expiresIn: "7d" });
  }
  refreshVerifier(token: string) {
    return jwt.verify(token, refreshSecret as string);
  }
  // Refresh tokens are stored hashed so a DB leak doesn't expose live sessions.
  hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}

export const jwtHelper = new JWT();
