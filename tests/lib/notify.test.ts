import { it, expect, vi, beforeEach } from "vitest";
const sendMock = vi.fn();
// vitest v4: vi.fn(() => obj) 화살표는 non-constructable라 `new Resend()`가 throw됨.
// constructable form으로 바꿔 동일 동작(emails.send 모킹)을 유지한다.
vi.mock("resend", () => ({ Resend: vi.fn(function (this: { emails: { send: typeof sendMock } }) { this.emails = { send: sendMock }; }) }));
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal("fetch", vi.fn()); });
import { notifyNewLead } from "@/lib/notify";

const quote = { shareId:"abc123abc123", tier:"mvp", consultNeeded:false, budgetLow:1_000_000, budgetHigh:2_000_000, contactName:"홍길동", contactValue:"kakao_id", contactChannel:"kakao", message:null } as never;

it("성공 시 둘 다 true", async () => {
  sendMock.mockResolvedValue({ data:{ id:"e1" }, error:null });
  (globalThis.fetch as any).mockResolvedValue({ ok:true });
  const r = await notifyNewLead(quote);
  expect(r.email).toBe(true); expect(r.telegram).toBe(true);
});
it("알림 실패해도 throw 안 함(best-effort)", async () => {
  sendMock.mockRejectedValue(new Error("resend down"));
  (globalThis.fetch as any).mockRejectedValue(new Error("tg down"));
  const r = await notifyNewLead(quote);            // must NOT throw
  expect(r.email).toBe(false); expect(r.telegram).toBe(false);
});
