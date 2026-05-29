# ADR 0002 — Next.js 풀스택

- **상태:** Accepted · **날짜:** 2026-05-30

## 결정
백엔드를 별도 두지 않고 Next.js(App Router) + API routes 단일 코드베이스(TypeScript)로 짓는다.

## 근거
- 1코드베이스·1배포(컨테이너 1개)·클라↔서버 타입 공유 → 1인 유지보수 최적.
- AI는 mindlogic 호출 1개라 FastAPI 분리 명분 없음.

## 대안
Next 프론트 + FastAPI(Python) 백 — 코드베이스 2·배포 2·CORS·타입 단절. 기각.

## 되돌림 조건
Python 전용 라이브러리(중한 ML)가 필요해지면 그 부분만 별도 서비스로 분리.
