# 구현 전 외부 셋업 체크리스트

> 코드 착수 전 확보해야 하는 외부 계정·키·인프라. 각 항목은 **종건님이 직접** 수행.
> 키 값 자체는 **절대 git에 올리지 않음** — `.env`(gitignore됨)에만. 아래는 "무엇을 어디서 받아 어디에 넣나".

## 🔴 필수 (없으면 핵심 기능 동작 불가)

### 1. 카카오 개발자 앱 (Auth.js OAuth)
- [ ] developers.kakao.com → 애플리케이션 추가
- [ ] **REST API 키** 발급 → `KAKAO_CLIENT_ID`
- [ ] 보안 → **Client Secret** 생성·활성화 → `KAKAO_CLIENT_SECRET`
- [ ] 카카오 로그인 활성화 + **Redirect URI** 등록: `https://{도메인}/api/auth/callback/kakao` (+ 로컬 `http://localhost:3000/...`)
- [ ] 동의항목: **닉네임**(필수). 이메일은 검수 필요할 수 있음 — 없으면 닉네임만으로 진행.
- ⚠️ gotcha: 이메일 동의는 카카오 비즈앱 심사 대상. 초기엔 닉네임만으로 가도 됨(리드 연락처는 폼에서 직접 받음).

### 2. mindlogic AI 게이트웨이 키 (교내)
- [ ] 교내 담당에게 **API 키 발급** 요청 → `MINDLOGIC_API_KEY` (x-api-key 헤더, **서버사이드 전용**)
- [ ] **base URL** 확인: `https://factchat-cloud.mindlogic.ai/v1/gateway` (Anthropic 호환 시 `/claude`) → `MINDLOGIC_BASE_URL`
- [ ] **쿼터/상한** 문의 — 우리 전역 킬스위치(200/일)를 게이트웨이 한도보다 낮게 설정해야 함.
- ⚠️ 키 노출 시 쿼터 폭파 → 반드시 서버 환경변수, 클라 번들에 절대 포함 금지.

### 3. Litestream 백업 (리드 단일 실패점 — ADR 0003)
- [ ] S3 호환 버킷 준비(권장: **Cloudflare R2** — 동일 생태계, 무료tier). 버킷 생성 + 액세스 키.
- [ ] `litestream.yml`에 SQLite 경로 + R2 타겟 지정 → `LITESTREAM_ACCESS_KEY_ID` / `LITESTREAM_SECRET_ACCESS_KEY`
- ⚠️ **라이브 SQLite를 Syncthing으로 직접 동기화 금지**(손상). 백업은 Litestream만.

## 🟡 공개 배포용 (랜딩 띄울 때)

### 4. Cloudflare 도메인 + Tunnel (ADR 0004)
- [ ] 커스텀 도메인 Cloudflare에 등록(네임서버 이전 또는 구매)
- [ ] `cloudflared` 터널 생성 → 토큰 → lab-server Docker Compose에 주입
- [ ] **관리자 페이지(/admin)는 터널에 노출 금지** — Tailscale 전용 유지
- [ ] WAF/Turnstile 설정(AI 엔드포인트 보호 보강)

### 5. Resend (이메일 알림)
- [ ] resend.com 가입 → `RESEND_API_KEY`
- [ ] 발신 도메인 인증(DNS) — 도메인 확보 후. 미확보 시 onboarding 발신주소로 시작 가능.

### 6. Telegram (운영자 핑) — 기존 hermes 재사용
- [ ] 기존 hermes 게이트웨이 토큰/채팅ID 재사용 → `TELEGRAM_*` (신규 발급 불필요)

## ⚠️ 비-인프라 확인 (랜딩 제작 전)

### 7. 포트폴리오 공개 동의/NDA
- [ ] ClassFileAuto — 공개 가능? 클라이언트/소속 데이터 얽힘 없나?
- [ ] likelion-sch.com — 공개 가능?
- [ ] Hedgehog WebCTF — 공개 가능?
- ⚠️ 셋 다 확인 전엔 랜딩에 노출 금지. 신뢰 자산의 핵심이므로 가장 먼저 확인.

---

## .env 키 목록 (구현 시 .env.example로 옮길 참고용 — 값은 비워둠)
```
# Auth
NEXTAUTH_SECRET=          # openssl rand -base64 32
NEXTAUTH_URL=             # https://{도메인}
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
# DB
DATABASE_URL=file:./prisma/prod.db
# AI (서버사이드 전용)
MINDLOGIC_API_KEY=
MINDLOGIC_BASE_URL=https://factchat-cloud.mindlogic.ai/v1/gateway
# AI rate limit (grill 확정 시작값 — 운영 중 조정)
AI_LIMIT_USER_DAY=10
AI_LIMIT_USER_MIN=3
AI_LIMIT_IP_DAY=20
AI_INPUT_CHAR_CAP=1000
AI_OUTPUT_MAX_TOKENS=1500
AI_GLOBAL_KILL_DAY=200
# 알림
RESEND_API_KEY=
TELEGRAM_BOT_TOKEN=       # hermes 재사용
TELEGRAM_CHAT_ID=
# 백업
LITESTREAM_ACCESS_KEY_ID=
LITESTREAM_SECRET_ACCESS_KEY=
```

## 의존성 그래프 (순서)
- **코드 착수에 막힘 없음:** 1·2(카카오·mindlogic 키)만 있으면 인증+AI 로컬 개발 시작 가능.
- 3·4·5는 **배포 직전**에 있으면 됨(로컬 개발은 SQLite 파일 + 콘솔 로그로 대체).
- 7은 랜딩 카피 작성 전 확인.
