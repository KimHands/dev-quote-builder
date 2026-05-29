# CLAUDE.md — dev-quote-builder

> 이 프로젝트 전용 지침. 전역 지침(`~/.claude/CLAUDE.md`: 한국어 설명, 짧은 함수,
> 의미 명확한 변수명, 변경 전 설명)은 그대로 따르고, 여기엔 **이 프로젝트만의 것**만 적는다.

## 디자인 시스템
UI·시각 결정 전에 항상 [DESIGN.md](DESIGN.md)를 읽는다. 색·폰트·간격·모션·시그니처
모티프가 거기 정의돼 있다. 포트폴리오(KimHands.github.io) 토큰을 채택한 **브랜드 통일**이
원칙 — 임의로 벗어나지 말 것. 핵심: 정제된 미니멀 + 터미널 모티프(절제), 라이트/다크,
블루 액센트(#0066cc/#2997ff), system-sans+Pretendard, mono 라벨. Warm/명조 톤은 폐기됨.

## 한 줄 정의

개발 외주를 **수주하기 위한** 1인 운영 사이트. 비개발 클라이언트가 "집 짓기" 비유
화면에서 선택 → 예상 견적/범위를 보고 → 상담으로 이어진다. (운영자: 김종건, 학부생 1인)

## 핵심 결정 (2026-05-30 office-hours + grill-me, 확정)

- **진짜 병목은 견적 자동화가 아니라 신뢰 증명 + 제안(outreach).** 코드보다 사람한테
  먼저 연락하는 게 우선이다. (코드 짓는 동안에도 The Assignment 아웃리치는 병행.)
- **견적의 본질은 '금액'이 아니라 '포함 범위'.** 포함/별도 명세를 항상 전면 노출.
- **빌드 스코프 = 풀스코프**(eng-review 2026-05-30 확정). office-hours/Codex는 "신뢰페이지
  먼저"를 권했으나, 포트폴리오·학습 가치 + 기존 lab-server 인프라를 근거로 풀스코프 선택.
  정밀 man-day 엔진만 C단계로 연기(실제 수주 후 보정), 나머지 6기능은 처음부터 구축.

### 아키텍처 (eng-review 확정 — 구현 시 이대로)

- **런타임:** Next.js 풀스택(App Router + API routes), TypeScript. 단일 코드베이스.
- **DB:** SQLite + Prisma (WAL 모드). 나중에 Postgres 전환 가역.
- **인증:** Auth.js + 카카오 OAuth. 엔드유저 + admin role 플래그(운영자만).
- **AI:** 교내 mindlogic 게이트웨이(`https://factchat-cloud.mindlogic.ai/v1/gateway[/claude]`,
  OpenAI/Anthropic SDK 호환, x-api-key, **서버사이드 전용**). AI 요구사항 정리기는
  **로그인 게이트 = 회원가입 유도**. 다층 방어(IP rate limit+일일상한+입력 cap) + Cloudflare
  WAF/Turnstile. 응답 **스트리밍**.
- **가격/티어:** `lib/quote/` 단일 모듈을 클라+서버 공유. **서버가 제출 시 재계산해 저장**
  (클라가 보낸 금액 신뢰 금지). zod 검증. 선택값 원본도 저장.
- **에러 핸들링:** 리드 저장=임계경로(트랜잭션). 알림=best-effort(실패해도 저장 성공).
  AI 타임아웃+graceful 폴백. 모든 외부 실패 Loki 로깅.
- **알림:** Resend(클라 확인메일+운영자 메일) + 기존 hermes Telegram(운영자 즉시 핑).
- **배포:** 개인 lab-server(Tailscale, 공개 불가) → **Cloudflare Tunnel(cloudflared) +
  커스텀 도메인**으로 공개. **관리자 페이지는 Tailscale 전용**(터널에 노출 금지). Docker
  Compose는 lab-server `stacks/personal/`에(git push→서버 git pull→`docker compose up -d`).
  백업 **Litestream**(⚠️ 라이브 SQLite를 Syncthing 직접 동기화 금지 — 손상). 관측 Beszel/Loki 재사용.
- **테스트:** 그린필드 23경로 전부 작성. 보안 테스트(서버 재계산으로 조작금액 무시,
  AI 인증·rate limit 강제). AI 정리기 **풀 eval 스위트**.
- **카톡:** 견적 제출 폼이 1차 리드 캡처, 카톡은 "지금 바로 상담" 급행 버튼(옵션).

### grill-me 확정 사항 (구현 시 이대로)

- **패키지 3단계:** ①랜딩·소개 ②MVP(핵심1~2개,2주) ③풀MVP(~4주). 기능모듈은 옵션.
- **가격(얼리버드·첫2건):** ① 30~60만 ② 100~200만 ③ 200~400만.
- **예상 예산대:** if/else 티어 분류 → 해당 구간만 표시. 리팩토링·급행·대규모 겹치면
  "상담 필요"(금액 미표시). 하단 항상 "정확 견적은 20분 상담 후 확정".
- **선금·계약:** 웜 직거래 5:5(선금50·잔금50 검수후), 플랫폼 경유 에스크로, 큰건 30/40/30.
  1페이지 계약서(범위·제외·일정·금액·수정2회·유지보수별도). 잔금은 검수 완료 후.
- **세무:** 무사업자로 시작(법인=3.3% 원천징수, 개인=계좌+현금영수증). **"부가세 별도"
  문구 쓰지 말 것 → "세금 계약 시 협의".** 연매출 커지면 간이과세 등록.
- **보안:** 이중구조 — 기본 신뢰 카피(무료, 전체) + 유료 add-on(결제·외부용·로그인 자동추천).
  "AI로 빠르게"·보안 검수 **과장 금지**.
- **채널:** 견적 제출 폼이 1차 리드 캡처, 카톡은 "지금 바로 상담" 급행 버튼. "예상
  예산대 결과"는 **DB 기반 영속 공유링크**(`/q/{shareId}`, 추측불가 랜덤 — ADR 0008)로 발급.
  (eng-review에서 백엔드 도입으로 상향 — 이전 "백엔드 불필요" 메모는 폐기.) 플랫폼(크몽/위시켓)은 실적 쌓은 뒤.
- **포트폴리오 공개:** ClassFileAuto·likelion-sch.com·Hedgehog WebCTF 공개 동의/NDA
  **확인 후** 노출 (미확인 상태).

## NOT in scope (의도적 연기 — 풀스코프 베이스라인 기준)

> ⚠️ 풀스코프 확정(ADR 0001) 이전의 "백엔드·AI·가입 짓지 마라" 지침은 **폐기됨**.
> 견적저장·알림·공유링크·관리자·AI정리기·이메일은 **처음부터 구축**한다. 아래만 연기:

- **정밀 man-day 견적 엔진**(multiplier 5종·버퍼 세부) — 캘리브레이션할 실데이터 없음. 지금은 티어 분류 룩업(ADR 0007). 첫 1~2건 수주 후 보정(C단계, TODOS.md).
- **프리랜서 플랫폼(크몽/위시켓) 등록** — 네트워크 수주로 리뷰 쌓은 뒤.
- **마일스톤 자동 생성** — 견적 핵심 검증 후.
- **결제 연동 / PDF 발급** — 선금은 수동(계좌/에스크로), 결과물은 공유링크+OG카드면 충분.

## 기술 스택 (풀스코프 — ADR 0002~0005, CONTEXT.md가 정본)

- **런타임:** Next.js 풀스택(App Router + API routes) + TypeScript. 단일 코드베이스.
- **DB:** SQLite + Prisma(WAL). 가격/티어=`lib/quote/` 클라+서버 공유, 서버 재계산 저장.
- **인증:** Auth.js + 카카오 OAuth(user/admin role). AI 정리기=로그인 게이트(rate limit).
- **배포:** 개인 lab-server(Tailscale) → **Cloudflare Tunnel + 커스텀 도메인**. 관리자=Tailscale 전용. 백업 Litestream 필수. (~~Vercel·백엔드 불필요는 폐기~~)

## 캐파 / 운영 제약

- **동시 진행 1건 원칙.** 1인이 2주 MVP를 병렬로 못 돌림. 둘째 건은 대기열로.
- 규모·기한 과도 입력 시 자동 견적 대신 "상담 필요"로 분기.

## 문서 위치

- 승인 설계 **정본**: `~/.gstack/projects/dev-quote-builder/kimjonggun-main-design-*.md`
  (`/plan-eng-review`·`/grill-me`가 자동으로 읽음)
- 보기용 **사본**: `docs/design.md`
- 원본 초안: `견적사이트_개발명세서.md` (참고용, 정본 아님)

## 다음 단계

> 계획 단계(office-hours→grill-me→eng-review→design→grill-with-docs) **전부 완료.**
> 모든 설계 결정은 CONTEXT.md + docs/adr/0001~0008에 확정됨. 코드 0줄.

1. **구현 착수** — Next.js 풀스택 스캐폴딩 + Prisma 스키마(CONTEXT.md §엔티티) 부터.
   구현 전 체크: Litestream·mindlogic 키·카카오 앱 등록·포트폴리오 NDA (docs/STATUS.md).
2. (코드와 병행) **The Assignment** — 실명 30명 → 5명에게 **가격 없는** 메시지 → 첫 상담 1건.
   사이트 완성을 기다리지 말 것. 진짜 병목은 아웃리치.
