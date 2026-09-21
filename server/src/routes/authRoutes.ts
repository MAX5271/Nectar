import { Router } from "express";
import { authController } from "../controller/authController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

router.post("/login", authController.login);
// Refresh/logout authenticate via the HttpOnly refresh cookie, not the access token.
router.get("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// Session management
router.get("/sessions", verifyJWT.verifyJWT.bind(verifyJWT), authController.getSessions);
router.delete("/sessions/:id", verifyJWT.verifyJWT.bind(verifyJWT), authController.revokeSession);

export default router;

