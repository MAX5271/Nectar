import { Router } from "express";
import { trackingController } from "../controller/trackingController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

router.use(verifyJWT.verifyJWT.bind(verifyJWT));

router.post("/weight", trackingController.logWeight);
router.get("/weight/trend", trackingController.getWeightTrend);

router.post("/meals", trackingController.logMeal);
router.get("/meals", trackingController.getDailyMealLogs);
router.get("/meals/trend", trackingController.getMealAdherenceTrend);

export default router;
