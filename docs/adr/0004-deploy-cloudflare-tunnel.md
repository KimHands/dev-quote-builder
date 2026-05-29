# ADR 0004 — 개인 lab-server + Cloudflare Tunnel

- **상태:** Accepted · **날짜:** 2026-05-30

## 맥락
배포 대상은 운영자 개인 lab-server([KimHands/lab-server](https://github.com/KimHands/lab-server)).
서버는 Tailscale(100.123.48.86)·학교망(10.x)에만 있어 **공개 인터넷에서 접근 불가**.
그러나 외부 비개발 고객이 들어와야 하는 리드 사이트라 공개 인그레스가 필수.

## 결정
- **Cloudflare Tunnel(cloudflared)** + 커스텀 도메인으로 공개. 아웃바운드 전용 → 포트포워딩·방화벽 우회.
- Cloudflare 앞단의 **무료 WAF/Turnstile/DDoS**로 AI 엔드포인트 남용 방어 보강.
- **관리자 페이지는 터널에 노출하지 않고 Tailscale 전용**(공개 인터넷 차단).
- Docker Compose를 lab-server `stacks/personal/`에 배치(git push→서버 git pull→`docker compose up -d`).
- TLS는 Cloudflare 종단 → Caddy/certbot 불필요.
- 관측: 기존 Beszel/Grafana/Loki 재사용.

## 대안
Tailscale Funnel — 네이티브지만 `*.ts.net` 도메인·WAF 없음·대역폭 제약. 고객 대면엔 부적합.

## 되돌림 조건
트래픽/안정성 요구가 개인 서버를 넘으면 매니지드(Vercel 등)로 이 앱만 분리.
