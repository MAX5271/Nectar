import { Router } from "express";
import { dietController } from "../controller/dietController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

router.get('/plan',verifyJWT.verifyJWT,dietController.dietPlan);
router.get('/latest',verifyJWT.verifyJWT,dietController.getLatestDietPlan);
router.get('/history',verifyJWT.verifyJWT,dietController.getDietPlanHistory);

export default router;