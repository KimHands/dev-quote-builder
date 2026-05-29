import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function SharedQuotePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  // 불변식: 공개 조회는 shareId로만 (id 금지)
  const quote = await prisma.quote.findUnique({ where: { shareId } });
  if (!quote) notFound();

  const won = (n: number) => `${(n / 10_000).toLocaleString()}만원`;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <h1>예상 견적</h1>
      {quote.consultNeeded ? (
        <p>이 조합은 상담이 필요합니다. 정확한 견적은 20분 상담 후 확정됩니다.</p>
      ) : (
        <p>
          예상 예산대:{" "}
          <strong>
            {won(quote.budgetLow!)} ~ {won(quote.budgetHigh!)}
          </strong>
        </p>
      )}
      <p style={{ color: "#666", fontSize: 14 }}>
        정확한 견적은 20분 상담 후 확정됩니다. (읽기 전용)
      </p>
    </main>
  );
}
