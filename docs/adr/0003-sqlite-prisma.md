# ADR 0003 — SQLite + Prisma

- **상태:** Accepted · **날짜:** 2026-05-30

## 결정
DB는 SQLite(WAL 모드) + Prisma ORM. 백업은 Litestream으로 외부 복제.

## 근거
- 단일 서버 상주 프로세스 + 저volume → SQLite의 약점(서버리스·다중쓰기)이 해당 안 됨.
- 운영 0, 백업=파일 복제. Prisma로 Postgres 전환 가역(provider 한 줄).

## 대안
자체 Postgres(Docker) — 동시성·고급기능 필요 시. 현재는 과함. / Supabase — 자체호스팅 의도와 충돌.

## 주의
- ⚠️ 라이브 SQLite 파일을 Syncthing으로 직접 동기화 금지(손상). `.backup` 스냅샷 또는 Litestream만.
- **Litestream 백업은 런칭 전 필수** — 리드 단일 실패점.

## 되돌림 조건
트래픽·동시쓰기·복잡 쿼리 증가 시 Prisma provider를 Postgres로 전환.
