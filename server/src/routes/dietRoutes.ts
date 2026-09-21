import { Router } from "express";
import { dietController } from "../controller/dietController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { generateLimiter } from "../middleware/rateLimiters.js";

const router = Router();

router.post("/plan", verifyJWT.verifyJWT.bind(verifyJWT), generateLimiter, dietController.dietPlan);
router.get("/latest", verifyJWT.verifyJWT.bind(verifyJWT), dietController.getLatestDietPlan);
router.get("/history", verifyJWT.verifyJWT.bind(verifyJWT), dietController.getDietPlanHistory);
router.get("/explain", verifyJWT.verifyJWT.bind(verifyJWT), dietController.explainPlan);
router.post("/swap", verifyJWT.verifyJWT.bind(verifyJWT), dietController.swapMeal);
router.get("/:id", verifyJWT.verifyJWT.bind(verifyJWT), dietController.getDietPlanById);

export default router;

