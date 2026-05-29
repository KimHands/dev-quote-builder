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
          env: {
            DATABASE_URL: `file:${TEST_DB}`,
            // 알림 테스트는 fetch/resend를 모킹한다. 텔레그램 가드(token+chatId)를
            // 통과시키기 위한 더미값 — 실제 전송은 일어나지 않는다.
            TELEGRAM_BOT_TOKEN: "test-token",
            TELEGRAM_CHAT_ID: "test-chat",
          },
          globalSetup: "./tests/setup-db.ts",
          // 단일 파일 SQLite test.db를 공유하므로 노드 스위트는 순차 실행 (파일 간 경합 방지)
          fileParallelism: false,
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
