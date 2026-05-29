"use client";

import type { QuoteResult } from "@/lib/quote/types";
import { wonRange } from "@/lib/quote/format";
import { INCLUDED, EXCLUDED } from "@/lib/quote/included";
import styles from "./ResultCard.module.css";

type Props = { result: QuoteResult };

const FOOTER = "정확한 견적은 20분 상담 후 확정됩니다.";

export function ResultCard({ result }: Props) {
  return (
    <section className={styles.card}>
      <div className={styles.live} aria-live="polite">
        {result.consultNeeded ? <ConsultView /> : <BudgetView result={result} />}
      </div>
      <p className={styles.footer}>{FOOTER}</p>
    </section>
  );
}

function ConsultView() {
  return (
    <div className={styles.consult}>
      <span className="seclabel">
        <span className="dot" />
        직접 확인 필요
      </span>
      <p className={styles.consultLead}>
        선택하신 범위는 자동 산정 대신 짧은 대화로 정리하는 편이 정확합니다.
        리팩토링·급행·대규모 작업이 섞이면 일정과 비용이 크게 달라집니다.
      </p>
      <a className={styles.cta} href="#">
        카톡으로 바로 문의하기
      </a>
    </div>
  );
}

function BudgetView({ result }: { result: QuoteResult }) {
  const range = wonRange(result.budgetLow!, result.budgetHigh!);
  return (
    <div className={styles.budget}>
      <span className="seclabel">
        <span className="dot" />
        예상 예산대
      </span>
      <p className={`${styles.amount} tnum`}>{range}</p>
      <p className={styles.why}>
        <span className={styles.whyKey}>왜 이 금액인가요?</span> 선택한 범위·기능과
        비슷한 작업의 평균 구간이에요.
      </p>
      <ScopeColumns />
    </div>
  );
}

function ScopeColumns() {
  return (
    <div className={styles.cols}>
      <ScopeList title="포함" items={INCLUDED} variant="included" />
      <ScopeList title="별도" items={EXCLUDED} variant="excluded" />
    </div>
  );
}

function ScopeList({
  title,
  items,
  variant,
}: {
  title: string;
  items: readonly string[];
  variant: "included" | "excluded";
}) {
  return (
    <div className={styles.col}>
      <span className={`${styles.colTitle} ${styles[variant]}`}>{title}</span>
      <ul className={styles.scopeList}>
        {items.map((item) => (
          <li key={item} className={styles.scopeItem}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
