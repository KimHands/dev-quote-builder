import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "@/app/api/quotes/route";
import { prisma } from "@/lib/db";

beforeEach(async () => {
  await prisma.quote.deleteMany();
});

function req(body: unknown): Request {
  return new Request("http://localhost/api/quotes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  selections: {
    platform: "web", audience: "internal", scale: "small", code: "new", urgency: "normal",
    feats: { login: true, pay: false, chat: false, admin: false, noti: false, ai: false, sec: false },
  },
  contactName: "홍길동", contactValue: "kakao_id", contactChannel: "kakao",
};

describe("POST /api/quotes", () => {
  it("저장 성공 시 shareId 반환", async () => {
    const res = await POST(req(validBody));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.shareId).toMatch(/^[0-9a-z]{12}$/);
  });

  it("클라가 보낸 금액은 무시하고 서버 재계산값 저장 (불변식)", async () => {
    const res = await POST(req({ ...validBody, budgetLow: 1, budgetHigh: 2 }));
    const { shareId } = await res.json();
    const saved = await prisma.quote.findUnique({ where: { shareId } });
    // login 1개 → mvp 100~200만 (클라가 보낸 1/2 아님)
    expect(saved?.budgetLow).toBe(1_000_000);
    expect(saved?.budgetHigh).toBe(2_000_000);
    expect(saved?.tier).toBe("mvp");
  });

  it("상담필요 조합은 금액 null로 저장", async () => {
    const body = { ...validBody, selections: { ...validBody.selections, code: "refactor" } };
    const { shareId } = await (await POST(req(body))).json();
    const saved = await prisma.quote.findUnique({ where: { shareId } });
    expect(saved?.consultNeeded).toBe(true);
    expect(saved?.budgetLow).toBeNull();
  });

  it("잘못된 페이로드는 400", async () => {
    const res = await POST(req({ selections: {} }));
    expect(res.status).toBe(400);
  });

  it("status 기본값 new로 저장", async () => {
    const { shareId } = await (await POST(req(validBody))).json();
    const saved = await prisma.quote.findUnique({ where: { shareId } });
    expect(saved?.status).toBe("new");
  });
});
