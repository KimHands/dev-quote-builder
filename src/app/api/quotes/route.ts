import { prisma } from "@/lib/db";
import { submitSchema } from "@/lib/quote/schema";
import { classify } from "@/lib/quote/classify";
import { newShareId } from "@/lib/shareId";

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

  return Response.json({ shareId: quote.shareId }, { status: 201 });
}
