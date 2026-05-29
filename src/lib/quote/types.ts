export type Platform = "web" | "app";
export type Audience = "internal" | "external";
export type Scale = "small" | "mid" | "large";
export type Code = "new" | "refactor";
export type Urgency = "normal" | "rush";

export type FeatureKey =
  | "login" | "pay" | "chat" | "admin" | "noti" | "ai" | "sec";

export type Features = Record<FeatureKey, boolean>;

export interface Selections {
  platform: Platform;
  audience: Audience;
  scale: Scale;
  code: Code;
  urgency: Urgency;
  feats: Features;
}

export type Tier = "landing" | "mvp" | "full" | "consult";

export interface QuoteResult {
  tier: Tier;
  consultNeeded: boolean;
  budgetLow: number | null;  // consult면 null (금액 숨김)
  budgetHigh: number | null;
}
