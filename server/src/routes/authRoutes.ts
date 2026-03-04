import { Router } from "express";
import { authController } from "../controller/authController.js";

const router = Router();

router.post('/login',authController.login);
router.get('/refresh',authController.refresh);

export default router;