# 관리자 + 알림 Implementation Plan (Plan 5/6)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Checkbox steps.

**Goal:** 리드 제출 시 운영자에게 즉시 알림(Resend 메일 + Telegram 핑, best-effort)을 보내고, 운영자가 /admin에서 리드를 보고 status를 전이(new→contacted→proposed→contracted→done + lost)할 수 있게 한다. **리드 저장=임계경로(절대 알림 실패로 안 막힘).**

**Architecture:** 알림 클라이언트는 best-effort(throw 금지, 실패는 로깅만). `/api/quotes`(Plan 1)에 저장 성공 후 best-effort 알림 추가(Plan 1 Task 8에서 연기한 하드닝). `/admin`은 `auth()`+`isAdmin` 가드(비admin 차단), Quote 목록·status 전이(서버 액션 or PATCH). Resend SDK + Telegram은 fetch.

**Tech Stack:** Next.js 16 · resend(npm) · Telegram Bot API(fetch) · next-auth v5(`auth`/`isAdmin`) · Prisma 7 · Vitest

**env(.env, SET):** RESEND_API_KEY · RESEND_FROM · ADMIN_EMAIL · TELEGRAM_BOT_TOKEN · TELEGRAM_CHAT_ID

**참조:** CONTEXT.md §status 상태머신·§에러핸들링(리드=트랜잭션, 알림=best-effort) · design.md(/admin mono 라벨·헤어라인 테이블) · ADR 0004(관리자 Tailscale 전용 — 코드 아닌 배포 가드, Plan 6)

## 라이브 검증 한계
실제 메일/텔레그램 발송은 종건님 dev에서 1회 수동 확인(런북). 테스트는 best-effort(실패 시 throw 안 함)·gating·status 전이를 mock으로 검증.

---

## File Structure
| 파일 | 책임 |
|------|------|
| `src/lib/notify/email.ts` | Resend best-effort(운영자 알림 + 클라 확인메일) |
| `src/lib/notify/telegram.ts` | Telegram best-effort 핑 |
| `src/lib/notify/index.ts` | `notifyNewLead(quote)` — 둘 다 best-effort 호출 |
| `src/app/api/quotes/route.ts` | (수정) 저장 성공 후 best-effort 알림 |
| `src/lib/quote/status.ts` | status 상수·전이 유효성(STATUSES, isValidStatus) |
| `src/app/admin/page.tsx` | isAdmin 가드 + 리드 목록(읽기) |
| `src/app/admin/actions.ts` | `updateStatus` 서버 액션(admin 가드 재확인) |
| `src/components/LeadRow.tsx` | 리드 1행 + status 변경 |
| tests | notify best-effort, status, admin 가드, quotes 알림 비차단 |

---

## Task 1: 알림 클라이언트 (TDD best-effort)
- [ ] `npm i resend`
- [ ] **Step1 failing test** `tests/lib/notify.test.ts` — Resend/fetch를 mock, 실패해도 `notifyNewLead`가 throw 안 하고 `{email:boolean, telegram:boolean}` 반환:
```ts
import { it, expect, vi, beforeEach } from "vitest";
const sendMock = vi.fn();
vi.mock("resend", () => ({ Resend: vi.fn(() => ({ emails: { send: sendMock } })) }));
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
```
- [ ] **Step2** RED. **Step3** 구현:
  - `email.ts`: `sendLeadEmail(quote)` — Resend로 운영자(ADMIN_EMAIL)에게 새 리드 메일. try/catch→실패 시 false 반환(throw 금지). (클라 확인메일은 contactChannel==="email"일 때만 추가 시도 — 선택.)
  - `telegram.ts`: `sendTelegram(text)` — `fetch(https://api.telegram.org/bot${TOKEN}/sendMessage, {chat_id, text})`. try/catch→false.
  - `index.ts`: `notifyNewLead(quote)` → `Promise.allSettled`로 둘 호출, `{email, telegram}` 불리언 반환. 절대 throw 안 함.
- [ ] **Step4** GREEN. **Step5** 커밋 `feat: best-effort lead notifications (Resend + Telegram, TDD)`

## Task 2: /api/quotes에 알림 연결 (TDD 비차단)
- [ ] **Step1** 기존 `tests/api/quotes.test.ts`에 케이스 추가(또는 새 파일): `@/lib/notify`를 mock해 `notifyNewLead`가 reject해도 **저장은 성공(201)하고 shareId 반환**.
```ts
vi.mock("@/lib/notify", () => ({ notifyNewLead: vi.fn().mockRejectedValue(new Error("notify fail")) }));
// ... 기존 정상 제출 → 여전히 201 + shareId + Quote 저장됨
```
- [ ] **Step2** RED(현재 라우트는 notify 호출 안 함). **Step3** route 수정: 저장(create) 성공 후 `notifyNewLead(quote)`를 호출하되 **await하지 않거나 try/catch로 감싸** 응답을 막지 않음(`void notifyNewLead(quote).catch(()=>{})` 또는 `try{await}catch{}`). 저장 트랜잭션이 임계경로, 알림은 best-effort. **클라 금액 불신·shareId 등 기존 불변식 유지.**
- [ ] **Step4** 기존 quotes 테스트 전부 + 새 케이스 GREEN. **Step5** 커밋 `feat: best-effort notify on quote submit (lead save stays critical path, TDD)`

## Task 3: status 상수·유효성 (TDD)
- [ ] **Step1 failing test** `tests/lib/status.test.ts`:
```ts
import { it, expect } from "vitest";
import { STATUSES, isValidStatus, STATUS_LABELS } from "@/lib/quote/status";
it("6개 상태", () => { expect(STATUSES).toEqual(["new","contacted","proposed","contracted","done","lost"]); });
it("유효성", () => { expect(isValidStatus("contacted")).toBe(true); expect(isValidStatus("zzz")).toBe(false); });
it("라벨 한국어", () => { expect(STATUS_LABELS.new).toBe("접수"); });
```
- [ ] **Step2** RED. **Step3** `src/lib/quote/status.ts`: `STATUSES` 배열(new/contacted/proposed/contracted/done/lost), `isValidStatus(s): s is Status`, `STATUS_LABELS`(접수/상담/제안/계약/완료/보류). **Step4** GREEN. **Step5** 커밋 `feat: quote status constants + validation (TDD)`

## Task 4: /admin 가드 + 리드 목록 + status 전이 (TDD where possible)
- [ ] **Step1:** `src/app/admin/page.tsx`(서버 컴포넌트): `const session = await auth(); if (!isAdmin(session)) { redirect("/") 또는 notFound() }`. admin이면 `prisma.quote.findMany({orderBy:{createdAt:"desc"}})`로 리드 목록 렌더(mono 라벨·헤어라인 테이블, design.md). 각 행=LeadRow.
- [ ] **Step2:** `src/app/admin/actions.ts`(`"use server"`): `updateStatus(id, status)` — **서버에서 isAdmin 재확인**(가드), `isValidStatus` 검증, `prisma.quote.update`. lost면 lostReason optional.
- [ ] **Step3:** `src/components/LeadRow.tsx`(`"use client"`): 리드 요약(이름·연락처·tier·예산대·createdAt) + status select(STATUSES) → 변경 시 `updateStatus` 서버액션 호출.
- [ ] **Step4 (test):** `tests/lib/admin-guard.test.ts` — `updateStatus`의 가드를 테스트하려면 `auth`·`prisma` mock. 비admin 세션이면 update 호출 전 거부(throw/no-op) 확인. (서버액션 직접 테스트가 까다로우면 가드 로직을 `assertAdmin(session)` 헬퍼로 분리해 TDD하고 액션은 그걸 호출.)
```ts
import { it, expect } from "vitest";
import { assertAdmin } from "@/lib/authz";
it("비admin은 거부", () => { expect(() => assertAdmin({ user:{ role:"user" } } as never)).toThrow(); });
it("admin 통과", () => { expect(() => assertAdmin({ user:{ role:"admin" } } as never)).not.toThrow(); });
```
(authz.ts에 `assertAdmin` 추가 — isAdmin false면 throw.)
- [ ] **Step5:** `npm test` 전체 GREEN + tsc + lint. dev에서 /admin 접근 시 비로그인/비admin은 막히고(리디렉트), admin은 목록 보이는지 — admin 세션 없이 헤드리스 확인 한계 있으므로 가드 로직 테스트 + 코드 리뷰로 갈음. **Step6:** 커밋 `feat: /admin lead list + status transitions (admin-guarded)`

## Task 5: 전체 검증 + 라이브 런북 + 머지
- [ ] `npm test` 전체 GREEN. tsc + lint 클린. `npm run dev` 부팅.
- [ ] **라이브 런북**(보고에 기재): (1) dev에서 견적 제출 → 운영자 메일(ADMIN_EMAIL) + Telegram 핑 수신 확인. Resend 발신도메인 미인증 시 onboarding@resend.dev로 본인에게만 가는지 확인. (2) 본인 User.role='admin' 지정 후 /admin 접근 → 리드 목록·status 변경 동작. (3) **관리자 페이지는 배포 시 Tailscale 전용**(ADR 0004) — Cloudflare 터널에 /admin 노출 금지, Plan 6에서 처리.
- [ ] main 머지 + 푸시.

## Self-Review
- 알림 best-effort(throw 금지)·리드저장 임계경로 → Task 1·2 ✅ (Plan 1 Task 8 연기분 해소)
- status 상태머신 전이(6상태) → Task 3·4 ✅
- /admin isAdmin 가드(서버 재확인) → Task 4 ✅
- NOT in scope: 관리자 Tailscale 인그레스 제한(배포 Plan 6), 정밀엔진(C단계).
- 라이브 메일/텔레그램/admin은 수동 검증(헤드리스 한계) 명시.
