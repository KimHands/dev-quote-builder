import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ResultCard } from "@/components/ResultCard";
import type { QuoteResult, Selections, Tier } from "@/lib/quote/types";
import styles from "@/app/page.module.css";

export default async function SharedQuotePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  // 불변식: 공개 조회는 shareId로만 (id 금지) — ADR 0008
  const quote = await prisma.quote.findUnique({ where: { shareId } });
  if (!quote) notFound();

  const result: QuoteResult = {
    tier: quote.tier as Tier,
    consultNeeded: quote.consultNeeded,
    budgetLow: quote.budgetLow,
    budgetHigh: quote.budgetHigh,
  };
  const selections = quote.selections as unknown as Selections;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className="seclabel">
          <span className="dot" />
          읽기 전용 · 공유된 견적
        </span>
        <h1 className={styles.title}>예상 견적</h1>
      </section>

      <ResultCard result={result} selections={selections} />
    </main>
  );
}
