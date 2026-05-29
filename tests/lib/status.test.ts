import { it, expect } from "vitest";
import { STATUSES, isValidStatus, STATUS_LABELS } from "@/lib/quote/status";
it("6개 상태", () => { expect(STATUSES).toEqual(["new","contacted","proposed","contracted","done","lost"]); });
it("유효성", () => { expect(isValidStatus("contacted")).toBe(true); expect(isValidStatus("zzz")).toBe(false); });
it("라벨 한국어", () => { expect(STATUS_LABELS.new).toBe("접수"); });
