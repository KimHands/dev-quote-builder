# Architecture Decision Records

이 프로젝트의 되돌리기-비용이 큰 결정 기록. 각 ADR은 맥락·결정·근거·대안·되돌림 조건을 담는다.
grill-with-docs는 이 결정들을 도메인 모델에 비춰 도전한다.

| ADR | 제목 | 상태 |
|-----|------|------|
| [0001](0001-full-scope-build.md) | 풀스코프 선구축 (vs 신뢰페이지 먼저) | Accepted (논쟁적) |
| [0002](0002-nextjs-fullstack.md) | Next.js 풀스택 (vs FastAPI 분리) | Accepted |
| [0003](0003-sqlite-prisma.md) | SQLite + Prisma (vs Postgres/Supabase) | Accepted |
| [0004](0004-deploy-cloudflare-tunnel.md) | 개인 lab-server + Cloudflare Tunnel | Accepted |
| [0005](0005-kakao-auth-ai-gate.md) | 카카오 OAuth + AI 정리기 로그인 게이트 | Accepted |
| [0006](0006-design-portfolio-unity.md) | 디자인=포트폴리오 토큰 통일 (vs Warm Craft) | Accepted |
| [0007](0007-tier-lookup-not-engine.md) | 티어 분류 룩업 (정밀 man-day 엔진은 C단계) | Accepted |
| [0008](0008-shareid-public-url.md) | 공개 견적 URL은 추측불가 shareId (IDOR 방지) | Accepted |
