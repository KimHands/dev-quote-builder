import { execSync } from "node:child_process";

export default function setup() {
  process.env.DATABASE_URL = "file:./test.db";
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    env: { ...process.env, DATABASE_URL: "file:./prisma/test.db" },
    stdio: "inherit",
  });
}
