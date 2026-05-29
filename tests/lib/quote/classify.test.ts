import { describe, it, expect } from "vitest";
import { classify } from "@/lib/quote/classify";
import type { Selections, Features } from "@/lib/quote/types";

const noFeats: Features = {
  login: false, pay: false, chat: false, admin: false, noti: false, ai: false, sec: false,
};
const base: Selections = {
  platform: "web", audience: "internal", scale: "small", code: "new", urgency: "normal",
  feats: { ...noFeats },
};
const withFeats = (...keys: (keyof Features)[]): Selections => ({
  ...base, feats: { ...noFeats, ...Object.fromEntries(keys.map((k) => [k, true])) } as Features,
});

describe("classify — 기본 티어(모듈 수)", () => {
  it("모듈 0개 → landing 30~60만", () => {
    expect(classify(base)).toEqual({
      tier: "landing", consultNeeded: false, budgetLow: 300_000, budgetHigh: 600_000,
    });
  });
  it("모듈 1개 → mvp 100~200만", () => {
    expect(classify(withFeats("login"))).toEqual({
      tier: "mvp", consultNeeded: false, budgetLow: 1_000_000, budgetHigh: 2_000_000,
    });
  });
  it("모듈 2개 → mvp", () => {
    expect(classify(withFeats("login", "noti")).tier).toBe("mvp");
  });
  it("모듈 3개 → full 200~400만", () => {
    expect(classify(withFeats("login", "noti", "pay"))).toEqual({
      tier: "full", consultNeeded: false, budgetLow: 2_000_000, budgetHigh: 4_000_000,
    });
  });
});

describe("classify — 상향(escalator)", () => {
  it("앱 + 모듈 0개 → landing 아님, mvp로 상향", () => {
    expect(classify({ ...base, platform: "app" }).tier).toBe("mvp");
  });
  it("규모=중 + 모듈 0개 → landing에서 한 칸 상향 mvp", () => {
    expect(classify({ ...base, scale: "mid" }).tier).toBe("mvp");
  });
  it("규모=중 + 모듈 1개(mvp) → full로 상향", () => {
    expect(classify({ ...withFeats("login"), scale: "mid" }).tier).toBe("full");
  });
  it("앱 + 규모=중 → mvp(앱바닥) 후 한 칸 → full", () => {
    expect(classify({ ...base, platform: "app", scale: "mid" }).tier).toBe("full");
  });
  it("앱 + 모듈 3개 → full (앱바닥은 landing에만 적용, 과상향 없음)", () => {
    expect(classify({ ...withFeats("login", "noti", "pay"), platform: "app" }).tier).toBe("full");
  });
  it("규모=중 + 모듈 3개 → full (사다리 상한 캡)", () => {
    expect(classify({ ...withFeats("login", "noti", "pay"), scale: "mid" }).tier).toBe("full");
  });
});

describe("classify — 상담필요 오버라이드(하나라도)", () => {
  it("리팩토링 단독 → consult, 금액 null", () => {
    expect(classify({ ...base, code: "refactor" })).toEqual({
      tier: "consult", consultNeeded: true, budgetLow: null, budgetHigh: null,
    });
  });
  it("급행 단독 → consult", () => {
    expect(classify({ ...base, urgency: "rush" }).consultNeeded).toBe(true);
  });
  it("대규모 단독 → consult", () => {
    expect(classify({ ...base, scale: "large" }).tier).toBe("consult");
  });
  it("상담필요는 모듈/상향보다 우선 — 모듈 3개여도 리팩토링이면 consult", () => {
    expect(classify({ ...withFeats("login", "pay", "chat"), code: "refactor" }).tier).toBe("consult");
  });
});
