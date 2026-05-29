# CONTEXT.md — dev-quote-builder 도메인 모델 & 용어

> 이 문서는 프로젝트의 **유비쿼터스 언어(ubiquitous language)**와 도메인 모델을 정의한다.
> grill-with-docs·구현·리뷰가 같은 단어를 같은 뜻으로 쓰게 하는 단일 출처.
> 상위 문서: [docs/design.md](docs/design.md)(설계 정본), [DESIGN.md](DESIGN.md)(디자인 시스템),
> [CLAUDE.md](CLAUDE.md)(프로젝트 지침), [docs/adr/](docs/adr/)(결정 기록).

## 한 줄 정의
비개발자 클라이언트가 "집 짓기" 비유 화면에서 선택만으로 실시간 자동 견적을 받는,
학부생 1인의 개발 외주 **수주용 단독 사이트** + 리드 관리 풀스택 앱.

## 핵심 도메인 개념 (용어 사전)

| 용어 | 정의 | 주의 |
|------|------|------|
| **Layer A (Client View)** | 클라이언트가 보는 화면. 집짓기 비유·금액만. 공수·단가 용어 노출 금지 | 명세서 §4 |
| **Layer B (Engine)** | 내부 견적 계산 로직. 현재는 **티어 분류 룩업**(if/else), 정밀 man-day 엔진은 C단계 | 클라에 내부 수치 노출 X |
| **티어 분류(Tier classification)** | 선택값 → 3패키지 티어 또는 "상담 필요"로 매핑하는 결정적 규칙(아래 §티어 분류 규칙). multiplier 곱셈 아님 | grill-with-docs 2026-05-30 확정 |
| **예상 예산대(Budget range)** | 클라에게 보여주는 금액 구간(예: 100~200만). 확정가 아님 | 정밀 견적 ≠ 예산대 |
| **패키지(Package)** | 파는 단위 3종: ①랜딩·소개 ②MVP(핵심1~2개,2주) ③풀MVP(~4주) | 가격 §아래 |
| **기능 모듈(Feature module)** | 견적 옵션: 회원·로그인/결제/실시간소통/관리자/알림/AI/보안점검 | 명세서 §6.3 |
| **4대 분기(+긴급도)** | 가중치 축: 플랫폼·대상·규모·코드(신규/리팩토링)·긴급도 | 명세서 §5.1 |
| **포함/별도(Included/Excluded)** | 견적 결과에 항상 노출하는 범위 명세. scope creep 방어의 핵심 | 명세서 §7.4 |
| **상담 필요(Consult-needed)** | 리팩토링·급행·대규모 겹침 등 1인 캐파 초과 시 자동 견적 대신 분기 | 캐파 가드레일 |
| **리드(Lead)** | 견적을 제출한 잠재 고객 레코드(선택값 JSON + 연락처 + 서버재계산 금액) | DB 저장 대상 |
| **공유링크(Share link)** | 저장된 견적의 영속 URL `/q/{shareId}`. **주 결과물**. 카톡 공유 시 동적 OG 이미지로 리치 카드 자동 렌더 | DB 기반, 클라사이드 인코딩 아님. PDF/다운로드는 폐기·연기 |
| **AI 요구사항 정리기** | 자유 입력("당근 같은 거")→구조화 기능 명세+옵션 자동체크. **로그인 게이트=가입 유도**(게이트 앞 "값 미리보기" 필수, 견적=비로그인/AI=로그인 의도적 비대칭) | mindlogic 게이트웨이 · [[ADR 0005]] |
| **검수(Audit)** | "보안 전공자가 직접 검수" — 신뢰 카피(무료) + 유료 add-on(이중구조) | 과장 금지 |

## 티어 분류 규칙 (grill-with-docs 2026-05-30 확정 — man-day 엔진 없는 결정적 룩업)
입력 도메인은 명세서 §5.1 4대분기(+긴급도) + §5.2 기능모듈 7종으로 확정.
1. **기본 티어(모듈 수):** 0개→① · 1~2개→② · 3개+→③
2. **상향(escalator):** 플랫폼=앱 → 최소 ②(앱은 ① 불가, 모듈과 합쳐지면 ③) · 규모=중(~10만) → 한 티어 상향
3. **상담 필요(가격 숨김, 최우선 오버라이드) — 아래 중 *하나라도* 해당 시 즉시 분기:**
   코드=리팩토링(미지 변수) · 긴급도=급행(동시 1건 캐파) · 규모=대(10만+, 1인 범위 초과)
> **"겹치면(2+ 중첩)"이 아니라 "하나라도(any single)"** — 각각 단독으로도 [[ADR 0007]] "검증 안 된 가격 약속 금지"와
> "동시 진행 1건" 캐파를 깨뜨림. design.md L118 "겹치면" 표현은 본 규칙으로 대체됨.

## 가격 (얼리버드·첫 2건 한정, 부가세 미표기 — 무사업자)
- ① 랜딩·소개: 30~60만 · ② MVP: 100~200만 · ③ 풀MVP: 200~400만
- 선금: 웜 직거래 5:5(잔금은 검수 후) / 플랫폼 경유 에스크로 / 풀MVP 큰건 30/40/30
- 세무: 무사업자 시작(법인=3.3% 원천징수, 개인=현금영수증). 연매출 커지면 간이과세

## 2-레이어 데이터 흐름
```
[Layer A 클라] 집짓기 선택 → lib/quote 티어분류 → 예상예산대/포함·제외 (표시용)
      │ 제출(선택값 JSON + 연락처)
      ▼
[Layer B / Next API] /api/quotes: zod검증 → lib/quote 서버재계산 → SQLite 저장 → shareId
      ├ (best-effort) Resend 메일 + hermes Telegram 핑
      └ 실패는 Loki, 저장은 트랜잭션 보장
/api/ai-parse: 로그인확인 → rate limit → mindlogic 스트리밍 → 구조화 명세
/q/{shareId} 저장견적 재현(추측불가 랜덤, id 조회 금지) · /admin role가드(Tailscale 전용)
```
**불변식(invariant):**
- 클라가 보낸 금액은 신뢰하지 않는다 — 서버가 lib/quote로 재계산한 값만 저장.
- **공개 견적 조회는 `shareId`로만** 한다. `/q/[shareId]`는 절대 PK(`id`)로 조회하지 않음. `id`는 내부/admin 전용. (IDOR 방지 — [[ADR 0008]])

## 엔티티 (grill-with-docs 2026-05-30 확정)
- **User**: Auth.js 표준(User/Account/Session) + `role`(user|admin). 카카오 OAuth. AI 정리기 게이트.
- **Quote(=Lead)**: `id`(cuid PK, 내부) · `shareId`(랜덤 nanoid, **공개 URL용**) · `userId?`(비로그인 가능) ·
  `selections`(JSON 원본) · `tier`(landing|mvp|full|consult, **서버 재계산**) · `consultNeeded`(bool) ·
  `budgetLow/High`(Int?, consult면 null) · `contactName/contactValue/contactChannel`(kakao|phone|email) ·
  `message?` · `status`(위 상태머신) · `lostReason?` · `createdAt`.
  - **보안 결정:** 공개 URL은 PK(`id`)가 아니라 추측불가 `shareId` 사용 → `/q/{shareId}`. 순차 PK 노출 시 IDOR로
    타인 리드(연락처) 열람당함. → [[ADR 0008]].
  - **불변식 일관:** `tier`·`consultNeeded`·`budget*`는 클라값 불신, 서버가 lib/quote로 재계산해 저장(영수증 보관).
  - **status 상태머신**(grill 2026-05-30 확정): `new`(접수)→`contacted`(상담)→`proposed`(제안)→`contracted`(계약·선금입금)→`done`(완료). 어느 단계서든 `lost`(보류/취소, 이유 메모)로 종결. 전이는 admin 수동(new 진입만 자동). 퍼널 통계=성공기준(상담3·제안3·계약1)에 직결.
  - **뺀 상태:** `in_progress`(필요시 추후), `queued`(동시 1건 캐파는 status 아닌 **운영 규칙** — 둘째 건도 정상 퍼널, 시작 시점만 운영자가 미룸. 대기를 status에 넣으면 퍼널 오염).
- **AiParse**: `id` · `userId`(로그인 필수) · `ip` · `input`(cap 적용) · `output`(JSON?, 실패 시 null) · `createdAt`.
  유일 목적=rate-limit 카운트 근거(누가·어디서·언제). **Quote와 FK 연결 안 함**(AI→폼 자동체크는 프론트에서 끝, DB 결합 불필요 — 단순함 우선).

## 비기능 요구 (핵심)
- 1인 캐파: **동시 진행 1건 원칙**.
- 신뢰성: Litestream 백업 필수(리드 단일 실패점). Cloudflare 앞단 WAF.
- 보안: AI 엔드포인트 인증+rate limit(키 쿼터 보호), 관리자 Tailscale 전용, 서버사이드 키, 공개 URL=shareId([[ADR 0008]]).
- **AI rate limit 시작값**(grill 2026-05-30, 전부 env 조정 가능): 사용자 10회/일·3회/분 · IP 20회/일 ·
  입력 1,000자 cap · 출력 max_tokens 1,500 · **전역 킬스위치 사이트 200회/일 초과→AI 비활성+Telegram 핑**.
  > 게이트웨이 쿼터 미지 → 개별 한도보다 **전역 킬스위치**가 핵심(갑작스런 키 정지 사고 방지). AiParse 레코드가 카운트 근거.
- 접근성: 모바일 우선, 키보드/스크린리더, 대비 4.5:1, reduced-motion.

## 열린 질문 (grill-with-docs에서 다룰 것)
- ~~패키지 티어 분류 임계값 세부 확정.~~ → ✅ 위 §티어 분류 규칙 (2026-05-30).
- ~~예상 예산대 결과물 포맷(공유링크 + 이미지?).~~ → ✅ 공유링크(주) + 동적 OG 카드(카톡 자동 미리보기), PDF 연기 (2026-05-30).
- 포트폴리오 3개 공개 동의/NDA.
- ~~Quote.status 상태머신 정의(접수→상담→계약→완료).~~ → ✅ 위 엔티티 §status (2026-05-30).
- ~~AI rate limit 구체 수치(분당/일일).~~ → ✅ 위 §비기능 AI rate limit (2026-05-30).
- ~~엔티티 스키마 확정(User/Quote/AiParse).~~ → ✅ 위 §엔티티 (2026-05-30).
