"use client";

import type { QuoteResult, Selections, Tier } from "@/lib/quote/types";
import { wonRange } from "@/lib/quote/format";
import { INCLUDED, EXCLUDED } from "@/lib/quote/included";
import {
  OPTION_LABELS,
  AXIS_ORDER,
  FEATURE_LABELS,
  FEATURE_ORDER,
} from "@/lib/quote/labels";
import styles from "./ResultCard.module.css";

type Props = { result: QuoteResult; selections: Selections };

const FOOTER = "정확한 견적은 20분 상담 후 확정됩니다.";

const METAPHOR: Record<Tier, string> = {
  landing: "한 페이지 소개·연락 중심의 작은 집을 짓는 규모예요.",
  mvp: "꼭 필요한 핵심 기능 1~2개로 시작하는 집이에요.",
  full: "여러 기능이 어우러진 큰 집 — 설계·시공 규모가 커집니다.",
  consult: "도면부터 함께 그려야 하는 집이라, 짧은 상담이 필요해요.",
};

const BANDING_NOTE =
  "기능을 더 골라도 같은 예산 구간일 수 있어요. 정확한 금액은 20분 상담에서 확정합니다.";

export function ResultCard({ result, selections }: Props) {
  return (
    <section className={styles.card}>
      <div className={styles.live} aria-live="polite">
        {result.consultNeeded ? <ConsultView /> : <BudgetView result={result} />}
        <SelectionSummary selections={selections} />
        <Metaphor tier={result.tier} />
        <p className={styles.banding}>{BANDING_NOTE}</p>
      </div>
      <p className={styles.footer}>{FOOTER}</p>
    </section>
  );
}

function Metaphor({ tier }: { tier: Tier }) {
  return <p className={styles.metaphor}>{METAPHOR[tier]}</p>;
}

function SelectionSummary({ selections }: { selections: Selections }) {
  const axisLabels: Record<(typeof AXIS_ORDER)[number], string> = {
    platform: OPTION_LABELS.platform[selections.platform],
    audience: OPTION_LABELS.audience[selections.audience],
    scale: OPTION_LABELS.scale[selections.scale],
    code: OPTION_LABELS.code[selections.code],
    urgency: OPTION_LABELS.urgency[selections.urgency],
  };
  const feats = FEATURE_ORDER.filter((key) => selections.feats[key]).map(
    (key) => FEATURE_LABELS[key],
  );
  return (
    <dl className={styles.summary}>
      {AXIS_ORDER.map((axis) => (
        <div key={axis} className={styles.summaryRow}>
          <dt className={styles.summaryKey}>{axis}</dt>
          <dd className={styles.summaryVal}>{axisLabels[axis]}</dd>
        </div>
      ))}
      <div className={styles.summaryRow}>
        <dt className={styles.summaryKey}>feats</dt>
        <dd className={styles.summaryVal}>
          {feats.length ? feats.join(", ") : "기능 없음"}
        </dd>
      </div>
    </dl>
  );
}

function ConsultView() {
  return (
    <div className={styles.consult}>
      <span className="seclabel">
        <span className="dot" />
        상담 필요
      </span>
      <p className={styles.consultLead}>
        선택하신 범위는 자동 산정 대신 짧은 대화로 정리하는 편이 정확합니다.
        리팩토링·급행·대규모 작업이 섞이면 일정과 비용이 크게 달라집니다.
      </p>
      <a className={styles.cta} href="#">
        카톡으로 상담하기
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
