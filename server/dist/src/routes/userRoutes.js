import { Router } from "express";
import { userController } from "../controller/userController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
const router = Router();
router.post('/signup', userController.signUp);
router.get('/profile', verifyJWT.verifyJWT, userController.getUserProfile);
export default router;
//# sourceMappingURL=userRoutes.js.map