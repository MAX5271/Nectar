import { Router } from "express";
import { dietController } from "../controller/dietController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { generateLimiter } from "../middleware/rateLimiters.js";

const router = Router();

router.post("/plan", verifyJWT.verifyJWT, generateLimiter, dietController.dietPlan);
router.get("/latest", verifyJWT.verifyJWT, dietController.getLatestDietPlan);
router.get("/history", verifyJWT.verifyJWT, dietController.getDietPlanHistory);
router.get("/:id", verifyJWT.verifyJWT, dietController.getDietPlanById);

export default router;
