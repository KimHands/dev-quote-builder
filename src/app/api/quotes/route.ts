import { prisma } from "@/lib/db";
import { submitSchema } from "@/lib/quote/schema";
import { classify } from "@/lib/quote/classify";
import { newShareId } from "@/lib/shareId";
import { notifyNewLead } from "@/lib/notify";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: "invalid payload" }, { status: 400 });
  }

  const { selections, contactName, contactValue, contactChannel, message } = parsed.data;

  // 불변식: 서버가 재계산한 값만 저장 (클라 금액 불신)
  const result = classify(selections);

  const quote = await prisma.quote.create({
    data: {
      shareId: newShareId(),
      selections: selections as object,
      tier: result.tier,
      consultNeeded: result.consultNeeded,
      budgetLow: result.budgetLow,
      budgetHigh: result.budgetHigh,
      contactName,
      contactValue,
      contactChannel,
      message,
    },
  });

  // best-effort 알림: 리드 저장이 임계경로. await 하지 않고 자체 catch로
  // 어떤 실패/throw도 응답에 영향 주지 못하게 한다.
  void notifyNewLead({
    shareId: quote.shareId,
    tier: quote.tier,
    consultNeeded: quote.consultNeeded,
    budgetLow: quote.budgetLow,
    budgetHigh: quote.budgetHigh,
    contactName: quote.contactName,
    contactValue: quote.contactValue,
    contactChannel: quote.contactChannel,
    message: quote.message,
  }).catch(() => {});

  return Response.json({ shareId: quote.shareId }, { status: 201 });
}
