import { z } from "zod";

export const selectionsSchema = z.object({
  platform: z.enum(["web", "app"]),
  audience: z.enum(["internal", "external"]),
  scale: z.enum(["small", "mid", "large"]),
  code: z.enum(["new", "refactor"]),
  urgency: z.enum(["normal", "rush"]),
  feats: z.object({
    login: z.boolean(), pay: z.boolean(), chat: z.boolean(), admin: z.boolean(),
    noti: z.boolean(), ai: z.boolean(), sec: z.boolean(),
  }),
});

// 금액 필드는 의도적으로 없음 — 서버가 classify로 계산(클라 금액 불신).
// 알 수 없는 키(budgetLow 등)는 zod 기본 동작으로 버려짐.
export const submitSchema = z.object({
  selections: selectionsSchema,
  contactName: z.string().min(1).max(50),
  contactValue: z.string().min(1).max(200),
  contactChannel: z.enum(["kakao", "phone", "email"]),
  message: z.string().max(1000).optional(),
});

export type SubmitInput = z.infer<typeof submitSchema>;
