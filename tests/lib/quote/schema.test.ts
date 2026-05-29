import { describe, it, expect } from "vitest";
import { submitSchema, selectionsSchema } from "@/lib/quote/schema";

const validSelections = {
  platform: "web", audience: "internal", scale: "small", code: "new", urgency: "normal",
  feats: { login: true, pay: false, chat: false, admin: false, noti: false, ai: false, sec: false },
};

describe("selectionsSchema", () => {
  it("유효한 선택값 통과", () => {
    expect(selectionsSchema.parse(validSelections)).toMatchObject({ platform: "web" });
  });
  it("잘못된 enum 거부", () => {
    expect(() => selectionsSchema.parse({ ...validSelections, scale: "huge" })).toThrow();
  });
});

describe("submitSchema", () => {
  const valid = {
    selections: validSelections,
    contactName: "홍길동", contactValue: "kakao_id", contactChannel: "kakao",
  };
  it("연락처 포함 제출 통과", () => {
    expect(submitSchema.parse(valid)).toMatchObject({ contactName: "홍길동" });
  });
  it("연락처 누락 거부", () => {
    expect(() => submitSchema.parse({ selections: validSelections })).toThrow();
  });
  it("클라가 보낸 budget 필드는 무시(스키마에 없음)", () => {
    const parsed = submitSchema.parse({ ...valid, budgetLow: 1, budgetHigh: 2 });
    expect(parsed).not.toHaveProperty("budgetLow");
  });
});
