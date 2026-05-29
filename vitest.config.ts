import { defineConfig } from "vitest/config";
import path from "node:path";

const TEST_DB = path.resolve(import.meta.dirname, "prisma/test.db");

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["tests/lib/**/*.test.ts", "tests/api/**/*.test.ts"],
          env: { DATABASE_URL: `file:${TEST_DB}` },
          globalSetup: "./tests/setup-db.ts",
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["tests/components/**/*.test.tsx"],
          setupFiles: ["./tests/setup-dom.ts"],
        },
      },
    ],
  },
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
});
