import { sendLeadEmail } from "./email";
import { sendTelegram } from "./telegram";

export type LeadNotice = {
  shareId: string;
  tier: string;
  consultNeeded: boolean;
  budgetLow: number | null;
  budgetHigh: number | null;
  contactName: string;
  contactValue: string;
  contactChannel: string;
  message: string | null;
};

// best-effort: 두 알림 모두 내부에서 에러를 삼키므로 이 함수는 절대 throw하지 않는다.
export async function notifyNewLead(quote: LeadNotice): Promise<{ email: boolean; telegram: boolean }> {
  const tg = `🆕 새 리드: ${quote.contactName} / ${quote.contactChannel} ${quote.contactValue} / ${quote.tier} / /q/${quote.shareId}`;
  const [email, telegram] = await Promise.all([sendLeadEmail(quote), sendTelegram(tg)]);
  return { email, telegram };
}
