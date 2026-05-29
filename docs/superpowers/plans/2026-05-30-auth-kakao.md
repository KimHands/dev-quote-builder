# 인증 (Auth.js + 카카오) Implementation Plan (Plan 3/6)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Checkbox steps.

**Goal:** Auth.js(NextAuth v5) + 카카오 OAuth로 로그인/로그아웃을 붙이고, User에 admin role 플래그를 두어 이후 관리자 가드와 AI 정리기 로그인 게이트의 기반을 만든다.

**Architecture:** Auth.js v5 App Router 패턴 — `src/auth.ts`가 `handlers/auth/signIn/signOut` export, `app/api/auth/[...nextauth]/route.ts`가 handlers 재노출. **DB 세션 전략 + PrismaAdapter**(이미 있는 `@/lib/db`의 libsql 기반 client 재사용). User/Account/Session/VerificationToken 모델 추가 + `role`. 세션 콜백이 `role`을 세션에 실어 가드/게이트에서 사용.

**Tech Stack:** next-auth@5(beta) · @auth/prisma-adapter · 카카오 provider · Prisma 7(libsql) · Vitest

**참조:** [ADR 0005](../../adr/0005-kakao-auth-ai-gate.md)(카카오+게이트, 견적=비로그인/AI=로그인 비대칭) · CONTEXT.md §엔티티 User(role) · `.env`(AUTH_SECRET, AUTH_KAKAO_ID, AUTH_KAKAO_SECRET, AUTH_URL — 모두 SET 확인됨)

## 라이브 검증 한계 (정직)
카카오 OAuth는 브라우저 리디렉트 플로우라 헤드리스 단위테스트로 완주 못 함. **테스트는 role 콜백·가드 헬퍼·모델·UI 렌더에 집중**하고, 실제 카카오 로그인 라운드트립은 종건님이 dev에서 1회 수동 확인(런북 제공).

---

## File Structure
| 파일 | 책임 |
|------|------|
| `prisma/schema.prisma` | User(+role)/Account/Session/VerificationToken 모델 추가 |
| `src/auth.ts` | NextAuth 설정(Kakao, PrismaAdapter, session 콜백 role) export |
| `src/app/api/auth/[...nextauth]/route.ts` | `export { GET, POST } = handlers` |
| `src/lib/authz.ts` | `isAdmin(session)`, `requireAdmin()` 가드 헬퍼 |
| `src/components/AuthButton.tsx` | 로그인(카카오)/로그아웃 버튼, 세션 반영 |
| `src/app/layout.tsx` | SessionProvider 래핑(클라 세션 접근용) |
| `tests/lib/authz.test.ts`, `tests/components/AuthButton.test.tsx` | role/가드/버튼 테스트 |

---

## Task 1: Auth.js 설치 + Prisma 모델
**Files:** package.json, prisma/schema.prisma, migration
- [ ] **Step 1:** `npm i next-auth@beta @auth/prisma-adapter`
- [ ] **Step 2:** schema.prisma에 Auth.js 표준 모델 추가 + User.role. (Auth.js v5 Prisma 스키마 그대로, SQLite 호환 타입.) 기존 Quote 모델은 유지. User 모델 예:
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  role          String    @default("user")
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
}
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
model VerificationToken {
  identifier String
  token      String
  expires    DateTime
  @@unique([identifier, token])
}
```
- [ ] **Step 3:** `npx prisma migrate dev --name add_auth_models` (생성 클라이언트 갱신). 확인: 마이그레이션 생성됨.
- [ ] **Step 4:** 테스트 DB도 새 모델 반영되는지 — `npm test` 실행 시 setup-db의 `prisma db push`가 test.db에 User 등 생성. 기존 36 테스트 깨지지 않는지 확인.
- [ ] **Step 5:** 커밋 `feat: add Auth.js prisma models (User+role/Account/Session/VerificationToken)`
> Prisma 7 주의: 생성 클라이언트는 `src/generated/prisma`. `@auth/prisma-adapter`는 표준 PrismaClient를 받으므로 `@/lib/db`의 `prisma`를 그대로 넘기면 됨. 어댑터 타입 에러 시 client 경로/타입 확인 후 적응(테스트 약화 금지).

## Task 2: auth.ts 설정 + 라우트 핸들러
**Files:** `src/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`
- [ ] **Step 1:** `src/auth.ts`:
```ts
import NextAuth from "next-auth";
import Kakao from "next-auth/providers/kakao";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Kakao],          // AUTH_KAKAO_ID / AUTH_KAKAO_SECRET 자동 인식
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as { role?: string }).role = (user as { role?: string }).role ?? "user";
      }
      return session;
    },
  },
});
```
- [ ] **Step 2:** `src/app/api/auth/[...nextauth]/route.ts`:
```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```
- [ ] **Step 3:** `npx tsc --noEmit` 통과(Auth.js v5 타입). 세션 타입 확장이 필요하면 `src/types/next-auth.d.ts`로 `Session.user.role` 선언 추가.
- [ ] **Step 4:** 커밋 `feat: NextAuth config (Kakao + Prisma adapter + role session)`
> v5 beta API 차이 시 적응(예: `Kakao` import 경로, `handlers` 구조). 핵심: `auth()`로 서버에서 세션 취득 가능 + 세션에 role 포함.

## Task 3: 인가 헬퍼 (TDD)
**Files:** `src/lib/authz.ts`, `tests/lib/authz.test.ts`
- [ ] **Step 1 (failing test):** `tests/lib/authz.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { isAdmin } from "@/lib/authz";
it("admin role이면 true", () => {
  expect(isAdmin({ user: { role: "admin" } } as never)).toBe(true);
});
it("user/누락이면 false", () => {
  expect(isAdmin({ user: { role: "user" } } as never)).toBe(false);
  expect(isAdmin(null)).toBe(false);
  expect(isAdmin({ user: {} } as never)).toBe(false);
});
```
- [ ] **Step 2:** RED. **Step 3:** `src/lib/authz.ts`:
```ts
import type { Session } from "next-auth";
export function isAdmin(session: Session | null): boolean {
  return (session?.user as { role?: string } | undefined)?.role === "admin";
}
```
(서버 가드 `requireAdmin`은 Plan 5 /admin에서 `auth()`와 함께 사용 — 여기선 순수 `isAdmin`만 TDD. 필요시 `requireAdmin`도 추가하되 `auth()` 의존은 mock.)
- [ ] **Step 4:** GREEN. **Step 5:** 커밋 `feat: isAdmin authz helper (TDD)`

## Task 4: SessionProvider + AuthButton (TDD)
**Files:** `src/app/layout.tsx`(SessionProvider), `src/components/AuthButton.tsx`, `tests/components/AuthButton.test.tsx`
- [ ] **Step 1:** layout에 `<SessionProvider>`(next-auth/react) 래핑. (layout은 서버 컴포넌트이므로 SessionProvider는 클라 경계 — `"use client"` 래퍼 컴포넌트 or next-auth v5의 SessionProvider 사용. App Router에선 보통 클라 provider 컴포넌트를 만들어 children 감쌈.)
- [ ] **Step 2 (failing test):** `tests/components/AuthButton.test.tsx` — `useSession`을 mock(`vi.mock("next-auth/react")`):
```tsx
import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signIn: vi.fn(), signOut: vi.fn(),
}));
import { useSession } from "next-auth/react";
import { AuthButton } from "@/components/AuthButton";

it("비로그인: 카카오 로그인 버튼", () => {
  (useSession as unknown as vi.Mock).mockReturnValue({ data: null, status: "unauthenticated" });
  render(<AuthButton />);
  expect(screen.getByRole("button", { name: /카카오|로그인/ })).toBeInTheDocument();
});
it("로그인: 로그아웃 버튼", () => {
  (useSession as unknown as vi.Mock).mockReturnValue({ data: { user: { name: "홍길동" } }, status: "authenticated" });
  render(<AuthButton />);
  expect(screen.getByRole("button", { name: /로그아웃/ })).toBeInTheDocument();
});
```
- [ ] **Step 3:** RED. **Step 4:** `AuthButton.tsx`(`"use client"`): `useSession()` 상태로 분기 — unauthenticated면 `onClick={() => signIn("kakao")}` "카카오로 로그인", authenticated면 이름 + `onClick={() => signOut()}` "로그아웃". pill 버튼(디자인 토큰). **Step 5:** GREEN + tsc. **Step 6:** 커밋 `feat: SessionProvider + AuthButton (TDD)`

## Task 5: 전체 검증 + 라이브 런북 + 머지
- [ ] `npm test` 전체 GREEN(node+dom). `npx tsc --noEmit` + `npm run lint` 클린.
- [ ] `npm run dev` 부팅 확인(에러 없이 `/`, `/api/auth/*` 라우트 존재). 카카오 실제 로그인은 종건님 수동(아래 런북).
- [ ] **라이브 런북**(docs에 한 줄 추가 or 보고에 기재): developers.kakao.com에서 Redirect URI `http://localhost:3000/api/auth/callback/kakao` 등록 확인 → dev에서 "카카오로 로그인" 클릭 → 동의 → 세션 생성 확인. admin 지정은 DB에서 본인 User.role을 'admin'으로 1회 수정(`UPDATE User SET role='admin' WHERE email=...` 또는 Prisma Studio).
- [ ] main 머지 + 푸시. 

## Self-Review
- Auth.js v5 + 카카오 + DB세션 + PrismaAdapter → Task 1·2 ✅
- role 세션 노출 + isAdmin 가드 기반 → Task 2·3 ✅
- 로그인/로그아웃 UI → Task 4 ✅
- 견적=비로그인/AI=로그인 비대칭(ADR 0005): 견적 폼은 그대로 비로그인(Plan 2), 이 Plan은 인증 인프라만. AI 게이트 적용은 Plan 4.
- NOT in scope: AI 정리기 게이트 UI(Plan 4), /admin 가드 적용(Plan 5).
- 라이브 카카오 검증은 수동(헤드리스 한계) — 정직히 명시.
