import { app } from "./app.js";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";
import prisma from "./utils/db.js";

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT} in ${config.NODE_ENV} mode`);
});

// Graceful shutdown
let isShuttingDown = false;
const shutdown = (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info({ signal }, "Received shutdown signal, starting graceful termination...");

  server.close(async () => {
    logger.info("HTTP server closed to new connections.");
    try {
      await prisma.$disconnect();
      logger.info("Prisma database connection disconnected cleanly.");
      process.exit(0);
    } catch (err) {
      logger.error({ err }, "Error during Prisma disconnection.");
      process.exit(1);
    }
  });

  // Force shutdown if drain takes more than 10s
  setTimeout(() => {
    logger.error("Forcefully shutting down server after timeout.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

