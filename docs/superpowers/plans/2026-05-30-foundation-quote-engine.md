# 기반 + 견적 엔진 Implementation Plan (Plan 1/6)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 비개발자의 선택값을 받아 서버가 티어를 재계산해 예산대/상담필요를 판정하고, 리드로 영속 저장한 뒤 추측불가 공유링크로 재현하는 핵심 스파인을 만든다.

**Architecture:** Next.js(App Router) 풀스택 단일 코드베이스. 가격/티어 로직은 `lib/quote/` 단일 모듈로 클라+서버 공유하되, **제출 시 서버가 재계산한 값만** SQLite에 저장(클라 금액 불신). 공개 조회는 PK가 아닌 랜덤 `shareId`로만(IDOR 방지). UI는 Plan 2.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Prisma + SQLite · zod · nanoid · Vitest

**참조 정본:** [CONTEXT.md](../../../CONTEXT.md) §티어 분류 규칙·§엔티티·불변식 · [ADR 0007](../../adr/0007-tier-lookup-not-engine.md) · [ADR 0008](../../adr/0008-shareid-public-url.md)

---

## File Structure

| 파일 | 책임 |
|------|------|
| `prisma/schema.prisma` | Quote 모델(=Lead) 정의. SQLite. |
| `src/lib/quote/types.ts` | Selections·Tier·QuoteResult 타입 (도메인 어휘 단일 출처) |
| `src/lib/quote/schema.ts` | zod 스키마 — selections + 제출 페이로드 검증(금액 미포함) |
| `src/lib/quote/classify.ts` | 티어 분류 순수 함수 (CONTEXT.md 규칙 그대로). 클라+서버 공유. |
| `src/lib/quote/index.ts` | 배럴 re-export |
| `src/lib/db.ts` | PrismaClient 싱글톤(dev HMR 누수 방지) |
| `src/lib/shareId.ts` | nanoid 기반 추측불가 공유 식별자 생성 |
| `src/app/api/quotes/route.ts` | POST: zod검증 → classify 재계산 → 저장 → `{shareId}` 반환 |
| `src/app/q/[shareId]/page.tsx` | 저장 견적 읽기전용 재현(shareId로만 조회) |
| `tests/lib/quote/classify.test.ts` | 티어 분류 전 분기 테스트 |
| `tests/lib/quote/schema.test.ts` | zod 검증 테스트 |
| `tests/api/quotes.test.ts` | API 보안 불변식(클라 금액 무시·shareId 발급) 테스트 |
| `tests/setup-db.ts` | 테스트 DB 마이그레이션 globalSetup |

---

## Task 1: 프로젝트 스캐폴딩

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts` 등 (create-next-app 산출)

- [ ] **Step 1: Next.js 앱 생성 (현재 디렉터리에)**

Run:
```bash
npx create-next-app@latest . --typescript --app --eslint --src-dir --import-alias "@/*" --no-tailwind --use-npm --yes
```
Expected: `src/app/` 생성, `package.json` 작성. (기존 docs/CLAUDE.md 등은 유지됨)

- [ ] **Step 2: 핵심 의존성 설치**

Run:
```bash
npm install prisma @prisma/client zod nanoid
npm install -D vitest
```
Expected: 에러 없이 설치 완료.

- [ ] **Step 3: 개발 서버 기동 확인 후 종료**

Run: `npm run dev` → 브라우저 없이 터미널에 `Ready` 뜨는지 확인 → Ctrl+C
Expected: `http://localhost:3000` Ready 로그.

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "chore: scaffold Next.js app (App Router, TS, src dir)"
```

---

## Task 2: Vitest 설정

**Files:**
- Create: `vitest.config.ts`, `tests/setup-db.ts`

- [ ] **Step 1: vitest 설정 작성**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: "./tests/setup-db.ts",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
```

- [ ] **Step 2: 테스트 DB globalSetup 작성**

Create `tests/setup-db.ts`:
```ts
import { execSync } from "node:child_process";

export default function setup() {
  process.env.DATABASE_URL = "file:./test.db";
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    env: { ...process.env, DATABASE_URL: "file:./prisma/test.db" },
    stdio: "inherit",
  });
}
```

- [ ] **Step 3: test 스크립트 추가**

Modify `package.json` scripts 객체에 추가:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: 커밋**

```bash
git add vitest.config.ts tests/setup-db.ts package.json
git commit -m "test: add vitest config and test-db setup"
```

---

## Task 3: Prisma + Quote 모델

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/db.ts`
- Modify: `.env`

- [ ] **Step 1: Prisma 초기화**

Run:
```bash
npx prisma init --datasource-provider sqlite
```
Expected: `prisma/schema.prisma`, `.env`(DATABASE_URL 포함) 생성.

- [ ] **Step 2: Quote 모델 작성**

Replace `prisma/schema.prisma` 의 model 영역에 (generator/datasource 아래):
```prisma
model Quote {
  id             String   @id @default(cuid())
  shareId        String   @unique
  userId         String?
  selections     Json
  tier           String
  consultNeeded  Boolean  @default(false)
  budgetLow      Int?
  budgetHigh     Int?
  contactName    String
  contactValue   String
  contactChannel String
  message        String?
  status         String   @default("new")
  lostReason     String?
  createdAt      DateTime @default(now())
}
```

- [ ] **Step 3: .env DATABASE_URL 확인**

Modify `.env`:
```
DATABASE_URL="file:./dev.db"
```

- [ ] **Step 4: 마이그레이션 + 클라이언트 생성**

Run:
```bash
npx prisma migrate dev --name init_quote
```
Expected: `prisma/migrations/` 생성, `@prisma/client` 생성됨.

- [ ] **Step 5: Prisma 싱글톤 작성**

Create `src/lib/db.ts`:
```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 6: 커밋**

```bash
git add prisma src/lib/db.ts .env.example
git commit -m "feat: add Quote(Lead) Prisma model + db singleton"
```
> 주의: `.env`는 gitignore됨(키 노출 금지). 위 add에서 `.env`는 제외됨이 정상.

---

## Task 4: 도메인 타입

**Files:**
- Create: `src/lib/quote/types.ts`

- [ ] **Step 1: 타입 정의 작성**

Create `src/lib/quote/types.ts`:
```ts
export type Platform = "web" | "app";
export type Audience = "internal" | "external";
export type Scale = "small" | "mid" | "large";
export type Code = "new" | "refactor";
export type Urgency = "normal" | "rush";

export type FeatureKey =
  | "login" | "pay" | "chat" | "admin" | "noti" | "ai" | "sec";

export type Features = Record<FeatureKey, boolean>;

export interface Selections {
  platform: Platform;
  audience: Audience;
  scale: Scale;
  code: Code;
  urgency: Urgency;
  feats: Features;
}

export type Tier = "landing" | "mvp" | "full" | "consult";

export interface QuoteResult {
  tier: Tier;
  consultNeeded: boolean;
  budgetLow: number | null;  // consult면 null (금액 숨김)
  budgetHigh: number | null;
}
```

- [ ] **Step 2: 타입체크 통과 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/lib/quote/types.ts
git commit -m "feat: add quote domain types"
```

---

## Task 5: 티어 분류 함수 (TDD)

**Files:**
- Create: `src/lib/quote/classify.ts`
- Test: `tests/lib/quote/classify.test.ts`

규칙(CONTEXT.md §티어 분류 규칙):
1. **상담필요 오버라이드(최우선):** code=refactor **또는** urgency=rush **또는** scale=large → `consult`, 금액 null.
2. 기본 티어(모듈 수): 0→landing · 1~2→mvp · 3+→full.
3. 상향: platform=app → landing이면 mvp로(앱은 ① 불가) · scale=mid → 사다리 한 칸 상향(full 상한).
4. 예산대: landing 30~60만 · mvp 100~200만 · full 200~400만.

- [ ] **Step 1: 실패하는 테스트 작성**

Create `tests/lib/quote/classify.test.ts`:
```ts
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
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- classify`
Expected: FAIL — "classify is not a function" / 모듈 없음.

- [ ] **Step 3: classify 구현**

Create `src/lib/quote/classify.ts`:
```ts
import type { Selections, Tier, QuoteResult } from "./types";

const BUDGET: Record<Exclude<Tier, "consult">, [number, number]> = {
  landing: [300_000, 600_000],
  mvp: [1_000_000, 2_000_000],
  full: [2_000_000, 4_000_000],
};

const LADDER: Exclude<Tier, "consult">[] = ["landing", "mvp", "full"];

function bumpOne(tier: Exclude<Tier, "consult">): Exclude<Tier, "consult"> {
  const i = LADDER.indexOf(tier);
  return LADDER[Math.min(i + 1, LADDER.length - 1)];
}

function countFeatures(s: Selections): number {
  return Object.values(s.feats).filter(Boolean).length;
}

export function classify(s: Selections): QuoteResult {
  // 1) 상담필요 오버라이드 (최우선)
  if (s.code === "refactor" || s.urgency === "rush" || s.scale === "large") {
    return { tier: "consult", consultNeeded: true, budgetLow: null, budgetHigh: null };
  }

  // 2) 기본 티어 (모듈 수)
  const n = countFeatures(s);
  let tier: Exclude<Tier, "consult"> = n === 0 ? "landing" : n <= 2 ? "mvp" : "full";

  // 3) 상향: 앱은 ① 불가
  if (s.platform === "app" && tier === "landing") tier = "mvp";
  // 3) 상향: 규모=중 → 한 칸
  if (s.scale === "mid") tier = bumpOne(tier);

  // 4) 예산대
  const [low, high] = BUDGET[tier];
  return { tier, consultNeeded: false, budgetLow: low, budgetHigh: high };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- classify`
Expected: PASS (전 분기 green).

- [ ] **Step 5: 커밋**

```bash
git add src/lib/quote/classify.ts tests/lib/quote/classify.test.ts
git commit -m "feat: tier classification with consult override (TDD)"
```

---

## Task 6: zod 스키마 (TDD)

**Files:**
- Create: `src/lib/quote/schema.ts`
- Test: `tests/lib/quote/schema.test.ts`

핵심 불변식: **제출 페이로드에 금액(budget)이 들어오면 안 된다** — 금액은 서버가 계산. 스키마는 금액 필드를 받지 않는다.

- [ ] **Step 1: 실패하는 테스트 작성**

Create `tests/lib/quote/schema.test.ts`:
```ts
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
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- schema`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: 스키마 구현**

Create `src/lib/quote/schema.ts`:
```ts
import { z } from "zod";

export const selectionsSchema = z.object({
  platform: z.enum(["web", "app"]),
  audience: z.enum(["internal", "external"]),
  scale: z.enum(["small", "mid", "large"]),
  code: z.enum(["new", "refactor"]),
  urgency: z.enum(["normal", "rush"]),
  feats: z.object({
    login: z.boolean(), pay: z.boolean(), chat: z.boolean(), admin: z.boolean(),
    noti: z.boolean(), ai: z.boolean(), sec: z.boolean(),
  }),
});

// 금액 필드는 의도적으로 없음 — 서버가 classify로 계산(클라 금액 불신).
// .strip()(zod 기본) 으로 알 수 없는 키(budgetLow 등)는 버려짐.
export const submitSchema = z.object({
  selections: selectionsSchema,
  contactName: z.string().min(1).max(50),
  contactValue: z.string().min(1).max(200),
  contactChannel: z.enum(["kakao", "phone", "email"]),
  message: z.string().max(1000).optional(),
});

export type SubmitInput = z.infer<typeof submitSchema>;
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- schema`
Expected: PASS.

- [ ] **Step 5: 배럴 export 작성**

Create `src/lib/quote/index.ts`:
```ts
export * from "./types";
export * from "./classify";
export * from "./schema";
```

- [ ] **Step 6: 커밋**

```bash
git add src/lib/quote/schema.ts src/lib/quote/index.ts tests/lib/quote/schema.test.ts
git commit -m "feat: zod submit schema (server-side budget, no client amount)"
```

---

## Task 7: shareId 생성기

**Files:**
- Create: `src/lib/shareId.ts`

- [ ] **Step 1: 구현 작성**

Create `src/lib/shareId.ts`:
```ts
import { customAlphabet } from "nanoid";

// 헷갈리는 문자(0/O/1/l/I) 제외, 12자 — 추측불가·URL 안전 (ADR 0008)
const nano = customAlphabet("23456789abcdefghijkmnpqrstuvwxyz", 12);

export function newShareId(): string {
  return nano();
}
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/lib/shareId.ts
git commit -m "feat: unguessable shareId generator (ADR 0008)"
```

---

## Task 8: POST /api/quotes (TDD — 보안 불변식)

**Files:**
- Create: `src/app/api/quotes/route.ts`
- Test: `tests/api/quotes.test.ts`

불변식 검증: (1) 클라가 보낸 금액은 무시되고 **서버 classify 값만 저장**, (2) 응답은 `shareId`만, (3) zod 실패는 400.

- [ ] **Step 1: 실패하는 테스트 작성**

Create `tests/api/quotes.test.ts`:
```ts
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
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- quotes`
Expected: FAIL — route 모듈 없음.

- [ ] **Step 3: route 구현**

Create `src/app/api/quotes/route.ts`:
```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { submitSchema } from "@/lib/quote/schema";
import { classify } from "@/lib/quote/classify";
import { newShareId } from "@/lib/shareId";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const { selections, contactName, contactValue, contactChannel, message } = parsed.data;

  // 불변식: 서버가 재계산한 값만 저장 (클라 금액 불신)
  const result = classify(selections);

  const quote = await prisma.quote.create({
    data: {
      shareId: newShareId(),
      selections: selections as object,
      tier: result.tier,
      consultNeeded: result.consultNeeded,
      budgetLow: result.budgetLow,
      budgetHigh: result.budgetHigh,
      contactName,
      contactValue,
      contactChannel,
      message,
    },
  });

  // 알림(Resend/Telegram)은 Plan 5에서 best-effort로 추가.
  return NextResponse.json({ shareId: quote.shareId }, { status: 201 });
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- quotes`
Expected: PASS (전 케이스 green).

- [ ] **Step 5: 커밋**

```bash
git add src/app/api/quotes/route.ts tests/api/quotes.test.ts
git commit -m "feat: POST /api/quotes with server recalc invariant (TDD)"
```

---

## Task 9: /q/[shareId] 읽기전용 재현

**Files:**
- Create: `src/app/q/[shareId]/page.tsx`

불변식: **shareId로만 조회**(PK `id` 사용 금지 — ADR 0008). 없는 shareId는 404.

- [ ] **Step 1: 페이지 구현**

Create `src/app/q/[shareId]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function SharedQuotePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  // 불변식: 공개 조회는 shareId로만 (id 금지)
  const quote = await prisma.quote.findUnique({ where: { shareId } });
  if (!quote) notFound();

  const won = (n: number) => `${(n / 10_000).toLocaleString()}만원`;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <h1>예상 견적</h1>
      {quote.consultNeeded ? (
        <p>이 조합은 상담이 필요합니다. 정확한 견적은 20분 상담 후 확정됩니다.</p>
      ) : (
        <p>
          예상 예산대:{" "}
          <strong>
            {won(quote.budgetLow!)} ~ {won(quote.budgetHigh!)}
          </strong>
        </p>
      )}
      <p style={{ color: "#666", fontSize: 14 }}>
        정확한 견적은 20분 상담 후 확정됩니다. (읽기 전용)
      </p>
    </main>
  );
}
```
> UI 디자인(집짓기·결과카드·포함/제외·OG 카드)은 Plan 2에서 DESIGN.md 토큰으로 본구현. 여기선 데이터 재현만 검증.

- [ ] **Step 2: 수동 동작 확인**

Run: `npm run dev` → 다른 터미널에서
```bash
curl -s -XPOST http://localhost:3000/api/quotes -H 'content-type: application/json' \
  -d '{"selections":{"platform":"web","audience":"internal","scale":"small","code":"new","urgency":"normal","feats":{"login":true,"pay":false,"chat":false,"admin":false,"noti":false,"ai":false,"sec":false}},"contactName":"홍길동","contactValue":"kakao","contactChannel":"kakao"}'
```
반환된 `shareId`로 `http://localhost:3000/q/{shareId}` 접속 → "100만원 ~ 200만원" 표시 확인. 없는 id `http://localhost:3000/q/zzzzzzzzzzzz` → 404 확인. Ctrl+C.

- [ ] **Step 3: 커밋**

```bash
git add src/app/q
git commit -m "feat: /q/[shareId] read-only quote reproduction (shareId-only lookup)"
```

---

## Task 10: 전체 검증 + 푸시

- [ ] **Step 1: 전체 테스트 통과**

Run: `npm test`
Expected: classify·schema·quotes 전부 PASS.

- [ ] **Step 2: 타입체크 + 린트**

Run: `npx tsc --noEmit && npm run lint`
Expected: 에러 없음.

- [ ] **Step 3: 푸시**

```bash
git push
```

---

## Self-Review (작성자 점검 완료)

**Spec coverage:**
- 티어 분류 규칙(상담필요 하나라도·앱바닥·중규모상향·모듈수) → Task 5 ✅
- 서버 재계산 불변식(클라 금액 불신) → Task 6 스키마 + Task 8 route + 테스트 ✅
- shareId 공개 조회/IDOR 방지(ADR 0008) → Task 7·8·9 ✅
- Quote 엔티티(CONTEXT.md) 전 필드 → Task 3 ✅
- status 기본 new → Task 3 default + Task 8 테스트 ✅

**의도적 비포함(다른 Plan):** UI/집짓기·결과카드(Plan 2) · 인증(Plan 3) · AI 정리기(Plan 4) · admin/알림(Plan 5) · 배포/Litestream(Plan 6) · 정밀 man-day 엔진(C단계, ADR 0007).

**Placeholder scan:** 모든 코드 스텝에 실제 코드·명령·기대출력 포함. TODO/TBD 없음.

**Type consistency:** `Selections`/`Features`/`Tier`/`QuoteResult`(types.ts) → classify/schema/route에서 동일 사용. `classify()` 시그니처·`newShareId()`·`submitSchema` 명칭 전 Task 일치 확인.
