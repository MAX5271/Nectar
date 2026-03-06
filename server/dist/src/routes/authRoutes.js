import { Router } from "express";
import { authController } from "../controller/authController.js";
import { verify } from "crypto";
import { verifyJWT } from "../middleware/verifyJWT.js";
const router = Router();
router.post('/login', authController.login);
router.get('/refresh', verifyJWT.verifyJWT, authController.refresh);
router.get('/logout', verifyJWT.verifyJWT, authController.logout);
export default router;
//# sourceMappingURL=authRoutes.js.map