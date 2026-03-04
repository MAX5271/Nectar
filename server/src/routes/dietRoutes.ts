import { Router } from "express";
import { dietController } from "../controller/dietController.js";
const router = Router();

router.get('/plan',dietController.dietPlan);

export default router;