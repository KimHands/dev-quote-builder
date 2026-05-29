import { it, expect, vi, beforeEach } from "vitest";
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/ai/client", () => ({
  mindlogic: vi.fn(),
  AI_MODEL: "claude-sonnet-4-6",
  SYSTEM_PROMPT: "sys",
}));
import { auth } from "@/auth";
import { mindlogic } from "@/lib/ai/client";
import { POST } from "@/app/api/ai-parse/route";
import { prisma } from "@/lib/db";

beforeEach(async () => { await prisma.aiParse.deleteMany(); vi.clearAllMocks(); });

function req(body: unknown) {
  return new Request("http://localhost/api/ai-parse", {
    method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4" },
    body: JSON.stringify(body),
  });
}

it("비로그인 401", async () => {
  vi.mocked(auth).mockResolvedValue(null as never);
  expect((await POST(req({ input: "당근 같은 거" }))).status).toBe(401);
});

it("로그인했지만 입력 cap 초과 400", async () => {
  vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);
  expect((await POST(req({ input: "x".repeat(5000) }))).status).toBe(400);
});

it("정상: 스트리밍 200 + AiParse 1건 기록", async () => {
  vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);
  // mock an async-iterable streaming completion
  async function* gen() {
    yield { choices: [{ delta: { content: "안녕" } }] };
    yield { choices: [{ delta: { content: "하세요" } }] };
  }
  vi.mocked(mindlogic).mockReturnValue({
    chat: { completions: { create: vi.fn().mockResolvedValue(gen()) } },
  } as never);

  const res = await POST(req({ input: "당근 같은 거" }));
  expect(res.status).toBe(200);
  const text = await res.text();
  expect(text).toContain("안녕");
  // 스트림 소비 후 기록되므로 약간 대기 불필요 — res.text()가 스트림을 끝까지 읽음
  const rows = await prisma.aiParse.findMany({ where: { userId: "u1" } });
  expect(rows).toHaveLength(1);
  expect(rows[0].output).toContain("하세요");
});
