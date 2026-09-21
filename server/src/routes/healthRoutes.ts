import { Router } from "express";
import prisma from "../utils/db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: "error",
      message: "Database connection failed",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
