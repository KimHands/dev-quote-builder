import { describe, it, expect } from "vitest";
import { wonRange, won } from "@/lib/quote/format";
describe("format", () => {
  it("만원 단위 단일", () => { expect(won(1_000_000)).toBe("100만원"); });
  it("범위", () => { expect(wonRange(1_000_000, 2_000_000)).toBe("100만원 ~ 200만원"); });
  it("천만 단위", () => { expect(won(20_000_000)).toBe("2,000만원"); });
});
