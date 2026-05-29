import { it, expect } from "vitest";
import { decideLimit } from "@/lib/ai/ratelimit";
const L = { userDay: 10, userMin: 3, ipDay: 20, globalDay: 200 };
it("한도 내면 허용", () => {
  expect(decideLimit({ userDay: 2, userMin: 1, ipDay: 5, globalDay: 50 }, L)).toEqual({ allowed: true });
});
it("전역 킬스위치 우선", () => {
  expect(decideLimit({ userDay: 0, userMin: 0, ipDay: 0, globalDay: 200 }, L).allowed).toBe(false);
});
it("사용자 일일 초과", () => {
  expect(decideLimit({ userDay: 10, userMin: 0, ipDay: 0, globalDay: 0 }, L).allowed).toBe(false);
});
it("분당 초과", () => {
  expect(decideLimit({ userDay: 0, userMin: 3, ipDay: 0, globalDay: 0 }, L).allowed).toBe(false);
});
it("IP 일일 초과", () => {
  expect(decideLimit({ userDay: 0, userMin: 0, ipDay: 20, globalDay: 0 }, L).allowed).toBe(false);
});
