import { execSync } from "node:child_process";
import path from "node:path";

export default function setup() {
  const testDb = path.resolve(import.meta.dirname, "..", "prisma", "test.db");
  const url = `file:${testDb}`;
  execSync("npx prisma db push --accept-data-loss", {
    env: { ...process.env, DATABASE_URL: url },
    stdio: "inherit",
  });
}
