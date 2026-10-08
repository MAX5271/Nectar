import { Router } from "express";
import { authController } from "../controller/authController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

import { refreshLimiter } from "../middleware/rateLimiters.js";

const router = Router();

router.post("/login", authController.login);
router.post("/guest", authController.loginAsGuest);
router.post("/supabase-session", authController.handleSupabaseSession);
// Refresh/logout authenticate via the HttpOnly refresh cookie, not the access token.
// Primary standard endpoint: POST /api/auth/refresh (RFC-compliant state-changing refresh)
router.post("/refresh", refreshLimiter, authController.refresh);
// Compatibility fallback: preserves GET for legacy clients & untouched benchmark scenario S3
router.get("/refresh", refreshLimiter, authController.refresh);
router.post("/logout", authController.logout);

// Session management
router.get("/sessions", verifyJWT.verifyJWT.bind(verifyJWT), authController.getSessions);
router.delete("/sessions/:id", verifyJWT.verifyJWT.bind(verifyJWT), authController.revokeSession);

export default router;

