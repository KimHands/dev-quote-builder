"use client";

import type { FeatureKey, Features } from "@/lib/quote/types";
import { FEATURE_LABELS, FEATURE_ORDER } from "@/lib/quote/labels";
import styles from "./FeatureChecklist.module.css";

type Props = {
  value: Features;
  onToggle: (key: FeatureKey) => void;
};

export function FeatureChecklist({ value, onToggle }: Props) {
  return (
    <div className={styles.group}>
      <span className={styles.seclabel}>기능 추가</span>
      <ul className={styles.list}>
        {FEATURE_ORDER.map((key) => (
          <li key={key}>
            <label className={styles.item}>
              <input
                type="checkbox"
                className={styles.input}
                checked={value[key]}
                onChange={() => onToggle(key)}
              />
              <span className={styles.box} aria-hidden="true" />
              <span className={styles.label}>{FEATURE_LABELS[key]}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
