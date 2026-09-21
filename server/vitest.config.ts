import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL || "postgresql://bench:bench@127.0.0.1:55432/nectar_test",
      GEMINI_MODE: "stub",
    },
  },
});
