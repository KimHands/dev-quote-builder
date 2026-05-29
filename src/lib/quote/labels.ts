import type { Platform, Audience, Scale, Code, Urgency, FeatureKey } from "./types";

export const AXIS_LABELS = {
  platform: "어디서 쓰나요?",
  audience: "누가 쓰나요?",
  scale: "얼마나 많은 사람이 쓰나요?",
  code: "새로 만드나요, 기존 걸 고치나요?",
  urgency: "얼마나 급한가요?",
} as const;

export const OPTION_LABELS = {
  platform: { web: "웹사이트 (PC·모바일 반응형)", app: "모바일 앱" },
  audience: { internal: "우리 팀 내부용", external: "외부 고객용" },
  scale: { small: "소규모 (~1천 명)", mid: "중간 (~10만 명)", large: "대규모 (10만 명+)" },
  code: { new: "새로 만들기", refactor: "기존 코드 개선·리팩토링" },
  urgency: { normal: "여유 있게", rush: "급해요 (빠른 납기)" },
} as const satisfies {
  platform: Record<Platform, string>; audience: Record<Audience, string>;
  scale: Record<Scale, string>; code: Record<Code, string>; urgency: Record<Urgency, string>;
};

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  login: "회원·로그인", pay: "결제", chat: "실시간 채팅",
  admin: "관리자 페이지", noti: "알림 보내기", ai: "AI 기능", sec: "보안 정밀 점검",
};

export const AXIS_ORDER = ["platform", "audience", "scale", "code", "urgency"] as const;
export const FEATURE_ORDER: FeatureKey[] = ["login", "pay", "chat", "admin", "noti", "ai", "sec"];
