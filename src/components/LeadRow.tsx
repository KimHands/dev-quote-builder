"use client";

import { useTransition } from "react";
import { updateStatus } from "@/app/admin/actions";
import { STATUSES, STATUS_LABELS } from "@/lib/quote/status";
import { wonRange } from "@/lib/quote/format";
import styles from "./LeadRow.module.css";

type Lead = {
  id: string;
  shareId: string;
  contactName: string;
  contactChannel: string;
  contactValue: string;
  tier: string;
  consultNeeded: boolean;
  budgetLow: number | null;
  budgetHigh: number | null;
  status: string;
  createdAt: string;
};

function budgetText(lead: Lead): string {
  if (lead.budgetLow === null || lead.budgetHigh === null) return "—";
  return wonRange(lead.budgetLow, lead.budgetHigh);
}

function dateText(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR");
}

export function LeadRow({ lead }: { lead: Lead }) {
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    startTransition(() => updateStatus(lead.id, next));
  }

  return (
    <div className={styles.row}>
      <span className={styles.name}>{lead.contactName}</span>
      <span className={styles.contact}>
        <span className={styles.channel}>{lead.contactChannel}</span>
        <span className={styles.value}>{lead.contactValue}</span>
      </span>
      <span className={styles.tier}>
        {lead.consultNeeded ? <span className={styles.consult}>상담필요</span> : lead.tier}
      </span>
      <span className={styles.budget}>{budgetText(lead)}</span>
      <span className={styles.date}>{dateText(lead.createdAt)}</span>
      <select
        className={styles.select}
        value={lead.status}
        onChange={onChange}
        disabled={pending}
        aria-label="상태 변경"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
