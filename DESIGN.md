# Design System — dev-quote-builder

> 출처: 운영자 포트폴리오 [KimHands.github.io](https://github.com/KimHands/KimHands.github.io)의
> 디자인 토큰을 채택해 **브랜드 통일**. 포트폴리오↔견적 사이트를 본 잠재 고객이
> "하나의 일관된 전문가"로 인식하게 한다.

## Product Context
- **What:** 비개발자 대상 개발 외주 자동견적 + 리드 사이트. "집 짓기" 비유로 전문용어 배제.
- **Who:** 한국 비개발 창업자·소상공인. 코딩 1도 모름.
- **Memorable thing (북극성):** "믿을 만한 전문가다." 모든 결정이 이걸 섬긴다.
- **Project type:** 풀스택 웹앱(랜딩 + 견적 설정 + 결과/공유 + AI 정리기 + 관리자).

## Aesthetic Direction
- **Direction:** 정제된 미니멀(Apple급 절제) + 개발자 터미널 모티프. 포트폴리오와 동일 톤.
- **Decoration level:** minimal — 타이포·여백·헤어라인이 일함. 터미널 블록은 **시그니처로 절제** 사용(전면 도배 금지 — 비개발자에게 과하면 안 됨).
- **Mood:** 차분하고 정밀하고 신뢰감 있음. 차가운 중립 + 블루 액센트.
- **Reference:** https://kimhands.github.io/

## Color (CSS variables — 포트폴리오와 동일)
```css
:root{
  --canvas:#ffffff; --soft:#fafafa; --ink:#1d1d1f; --charcoal:#525252;
  --body:#737373; --mute:#a3a3a3; --hairline:#e5e5e5; --hairline-strong:#d4d4d4;
  --dark:#171717; --on-dark:#ffffff; --on-dark-mute:rgba(255,255,255,.66);
  --accent:#0066cc; --accent-soft:#eaf2fc;
}
[data-theme="dark"]{
  --canvas:#1f1f23; --soft:#2a2a2f; --ink:#f5f5f7; --charcoal:#c9c9cf;
  --body:#9c9ca3; --mute:#7e7e86; --hairline:#36363d; --hairline-strong:#47474f;
  --dark:#2a2a2f; --on-dark:#ffffff; --on-dark-mute:rgba(255,255,255,.7);
  --accent:#2997ff; --accent-soft:#1b2a3d;
}
```
- **Accent #0066cc / dark #2997ff** = 링크·"왜 이 금액" 강조·선택 표시·터미널 프롬프트.
- **Semantic:** success는 green 계열(#27c93f 톤, 터미널 신호등과 동일 계열), error #ff5f56, warning #ffbd2e — 터미널 신호등 색과 통일.
- **검수·안심**도 accent 블루로 통일(별도 green 남발 금지). 보안 배지만 차분히.

## Typography
- **Sans (본문·UI):** `'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Inter', 'Segoe UI', sans-serif`
  - 포트폴리오의 system 스택 유지 + **Pretendard를 맨 앞**에 둬 한글 렌더링을 모든 기기에서 일관되게.
- **Mono (터미널·섹션 라벨·기술 메타·금액 강조):** `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, 'JetBrains Mono', monospace`
- **Base:** 17px / line-height 1.5 / letter-spacing -.01em
- **Scale (포트폴리오 기준):**
  - hero h1: 60px / 600 / -.035em / 1.02 (모바일 44px)
  - section h2: 30px / 600 / -.025em
  - card h3: 21px / 600 / -.02em
  - lead: 19px / charcoal
  - body: 16~17px / charcoal
  - 섹션 라벨: mono 12px / uppercase / letter-spacing .06em / mute (+ accent dot)
  - 금액(price): mono 또는 sans 대형, **tabular-nums** 필수
- **No serif.** 디스플레이도 sans(또는 mono 모티프). 따뜻한 명조 톤은 폐기(운영자 취향).

## Spacing
- **Base unit:** 4px. Scale: 4 · 8 · 12 · 16 · 24 · 32 · 48.
- **Section padding:** 88px (모바일 64px).
- **Density:** comfortable. 여백이 신뢰를 만든다.

## Layout
- **Max content width (--page):** 1080px. **읽기 폭(--measure):** 640px.
- **Page padding:** 0 40px (모바일 0 24px).
- **Dividers:** 1px hairline. 박스보다 헤어라인 구분 선호.
- **Sticky nav:** 60px, `backdrop-filter: blur(12px)` + 반투명 canvas.
- **섹션 라벨 패턴:** mono uppercase + accent dot (`.seclabel .dot`).
- **카드 radius:** 14px. **pill:** 9999px(버튼·태그). 작은 요소 6~8px.

## Signature Motifs (브랜드 시그니처 — 절제 사용)
- **터미널 블록:** 신호등 점(빨강 #ff5f56 / 노랑 #ffbd2e / 초록 #27c93f) + mono pre + 깜빡이는 accent 커서. → 견적 **결과 요약**을 터미널 출력처럼 보여주는 데 1회 활용 가능(과용 금지).
- **Pill 버튼:** 주요 CTA는 `background: ink; color: canvas; border-radius: 9999px`.
- **mono 섹션 라벨 + accent dot.**
- **하단 밑줄 호버:** 링크는 scaleX 밑줄 애니메이션.

## Motion
- **Reveal:** 진입 시 opacity 0→1 + translateY(16px→0), 0.7s cubic-bezier(.2,.7,.2,1), 계단식 지연 .08/.16/.24s.
- **Theme transition:** background/color 0.3s ease.
- **Cursor blink:** 1.05s steps(1) — 터미널 모티프.
- **금액 카운트업:** 선택 변경 시 숫자 부드럽게 전환(reduced-motion 존중).
- `prefers-reduced-motion` 존중 — 모든 reveal/animation 비활성 분기.

## 견적 사이트 적용 가이드
- **집짓기 선택 카드:** 14px radius 헤어라인 카드. 선택 시 `border-color: ink` + accent 표시(포트폴리오 .card:hover 패턴 재사용).
- **결과 카드:** 큰 금액(tabular-nums), "왜 이 금액"은 accent 강조 목록, 포함/별도는 헤어라인 2단. 선택적으로 터미널 블록으로 "견적 요약" 출력.
- **AI 요구사항 정리기:** 스트리밍 출력을 **터미널 블록 + 깜빡 커서**로 — 시그니처와 가장 잘 맞는 화면.
- **관리자 페이지:** mono 라벨 + 헤어라인 테이블. 포트폴리오 .srow/.timeline 패턴 재사용.
- **비개발자 배려:** 터미널 모티프는 "멋"이지 "벽"이 되면 안 됨. 핵심 선택·금액·CTA는 평이한 한글 sans로. 터미널은 AI 정리기·결과 요약 등 1~2곳에만.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-30 | 포트폴리오(KimHands.github.io) 토큰 채택 | 운영자 브랜드 통일 — 잠재 고객이 일관된 전문가로 인식 |
| 2026-05-30 | Warm Craft(크림/코랄/명조) 폐기 | 운영자 개인 취향이 아님, 포트폴리오와 불일치 |
| 2026-05-30 | system-sans + Pretendard 한글 보강 | 포트폴리오 Apple-미니멀 톤 유지 + 한글 일관성 |
