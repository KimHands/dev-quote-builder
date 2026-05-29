# STATUS — 세션 핸드오프 (2026-05-30)

새 세션이 여기서 이어간다. 다음 작업: **구현 착수**(또는 plan-eng-review 재확인).
grill-with-docs **완료** — 아래 6개 열린질문 전부 해결, CONTEXT.md/ADR 인라인 갱신됨.

## 지금까지 (오늘 한 흐름)
office-hours → grill-me → plan-eng-review → design-consultation → plan-design-review.
전부 plan 단계. **코드는 아직 0줄.**

## 무엇이 확정됐나
- **제품:** 비개발자 대상 "집 짓기" 비유 자동견적 + 리드 풀스택 사이트. 학부생 1인 외주 수주용.
- **스코프:** 풀스코프(견적저장+알림+공유링크+관리자+AI정리기+이메일). 정밀 엔진만 C단계. (ADR 0001/0007)
- **스택:** Next.js 풀스택 + SQLite/Prisma + Auth.js 카카오 + mindlogic AI + Resend/Telegram. (ADR 0002/0003/0005)
- **배포:** 개인 lab-server(Tailscale) → Cloudflare Tunnel + 커스텀 도메인, 관리자 Tailscale 전용. (ADR 0004)
- **디자인:** 포트폴리오(KimHands.github.io) 토큰 통일. DESIGN.md 확정. (ADR 0006)
- **가격/선금/세무:** 30-60/100-200/200-400만, 웜 5:5·플랫폼 에스크로, 무사업자 시작. (CONTEXT.md)
- **리뷰 상태:** Eng CLEAR, Design CLEAR(4→8.5). Codex는 풀스코프에 반대했으나 유저 유지.

## 문서 지도
- [CONTEXT.md](../CONTEXT.md) — 도메인 모델·용어 (grill-with-docs 주 입력)
- [docs/design.md](design.md) — 설계 정본(아키텍처+상태표+반응형/a11y+리뷰리포트)
- [DESIGN.md](../DESIGN.md) — 디자인 시스템
- [docs/adr/](adr/) — 결정 기록 0001~0008 (0008=shareId 공개URL)
- [CLAUDE.md](../CLAUDE.md) — 프로젝트 지침
- [TODOS.md](../TODOS.md) — C단계 엔진·크몽 등록
- 견적사이트_개발명세서.md — 원본 초안(참고용, 정본 아님)
- gstack 정본: `~/.gstack/projects/dev-quote-builder/kimjonggun-main-design-20260530-000505.md`

## grill-with-docs 결과 (2026-05-30, 전부 ✅) — 상세는 CONTEXT.md
1. ✅ **Quote.status 상태머신:** new→contacted→proposed→contracted→done + lost(어디서든). queued/in_progress 제외(캐파는 운영규칙).
2. ✅ **티어 분류 규칙:** 모듈 0/1~2/3+ → ①/②/③, 앱·중규모 상향, **리팩토링·급행·대규모 *하나라도* → 상담필요**(design.md "겹치면" 대체).
3. ✅ **AI rate limit:** 사용자 10/일·3/분, IP 20/일, 입력 1,000자, 출력 1,500토큰, **전역 킬스위치 200/일→비활성+핑**.
4. ✅ **결과물 포맷:** 공유링크 `/q/{shareId}`(주) + 동적 OG 카드(카톡 미리보기). PDF 연기.
5. ✅ **ADR 0005 재검증:** 유지 + 보정 2개(비대칭 명문화, 게이트 앞 값 미리보기).
6. ✅ **엔티티 스키마:** User/Quote/AiParse 확정. 공개 URL=shareId(IDOR 방지) → **ADR 0008 신규**.

## 여전히 열린 (실세계 액션 — 설계 아님)
- ⚠️ 포트폴리오 3개(ClassFileAuto·likelion-sch.com·Hedgehog WebCTF) 공개 동의/NDA 확인.

## 구현 전 필수 체크 (코드 시작 전)
- 🔴 **Litestream 백업** 구성(리드 단일 실패점) — ADR 0003.
- ⚠️ 포트폴리오 3개(ClassFileAuto·likelion-sch.com·Hedgehog WebCTF) 공개 동의/NDA 확인.
- 🟡 mindlogic AIHub **API 키 발급** + 쿼터 가이드 확인.
- 🟡 카카오 개발자 앱 등록(OAuth 키), Cloudflare 도메인.

## 비-코드 과제 (office-hours, 여전히 유효)
실명 30명 → 5명에게 **가격 없는** 메시지 → 첫 상담 1건. 사이트 완성 기다리지 말 것.
