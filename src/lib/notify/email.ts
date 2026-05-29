import { Resend } from "resend";
import type { LeadNotice } from "./index";

// 운영자에게 새 리드 알림. best-effort: 실패 시 false (throw 금지).
export async function sendLeadEmail(quote: LeadNotice): Promise<boolean> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const res = await resend.emails.send({
      from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
      to: process.env.ADMIN_EMAIL ?? "",
      subject: `새 견적 리드: ${quote.contactName} (${quote.tier})`,
      text: `이름: ${quote.contactName}\n연락: ${quote.contactChannel} ${quote.contactValue}\n티어: ${quote.tier}\n예산: ${quote.budgetLow}~${quote.budgetHigh}\n공유: /q/${quote.shareId}\n메모: ${quote.message ?? "-"}`,
    });
    if ((res as { error?: unknown }).error) return false;
    return true;
  } catch {
    return false;
  }
}
