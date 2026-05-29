import { defineConfig } from "vitest/config";
import path from "node:path";

const TEST_DB = path.resolve(import.meta.dirname, "prisma/test.db");

export default defineConfig({
  test: {
    environment: "node",
    env: { DATABASE_URL: `file:${TEST_DB}` },
    globalSetup: "./tests/setup-db.ts",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
});
