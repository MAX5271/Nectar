import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dietRouter from "./routes/dietRoutes.js";
import healthRouter from "./routes/healthRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authLimiter } from "./middleware/rateLimiters.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { config } from "./config.js";

export const app = express();

const allowedOrigins = [config.CLIENT_URL, "http://localhost:5173"].filter(
  Boolean,
) as string[];

if (config.NODE_ENV === "production") app.set("trust proxy", 1);

app.use(requestLogger);
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Health check endpoint mounted before rate limiting & auth
app.use("/health", healthRouter);

app.use("/api/auth/login", authLimiter);
app.use("/api/user/signup", authLimiter);

app.use("/api/auth", authRouter);
app.use("/api/user", userRoutes);
app.use("/api/diet", dietRouter);

app.use(errorHandler);

export default app;
