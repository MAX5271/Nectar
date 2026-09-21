import { Router } from "express";
import { authController } from "../controller/authController.js";

const router = Router();

router.post("/login", authController.login);
// Refresh/logout authenticate via the HttpOnly refresh cookie, not the access token.
router.get("/refresh", authController.refresh);
router.post("/logout", authController.logout);

export default router;
