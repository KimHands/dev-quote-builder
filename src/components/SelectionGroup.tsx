"use client";

import { useRef } from "react";
import styles from "./SelectionGroup.module.css";

type Props<K extends string> = {
  legend: string;
  options: Record<K, string>;
  value: K;
  onChange: (key: K) => void;
  name: string;
};

export function SelectionGroup<K extends string>({
  legend,
  options,
  value,
  onChange,
  name,
}: Props<K>) {
  const keys = Object.keys(options) as K[];
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const moveTo = (index: number) => {
    const clamped = Math.max(0, Math.min(keys.length - 1, index));
    const key = keys[clamped];
    onChange(key);
    refs.current[clamped]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        moveTo(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        moveTo(index - 1);
        break;
      case " ":
      case "Enter":
        event.preventDefault();
        onChange(keys[index]);
        break;
    }
  };

  return (
    <div role="radiogroup" aria-label={legend} className={styles.group}>
      <span className={styles.legend}>{legend}</span>
      <div className={styles.options}>
        {keys.map((key, index) => {
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              ref={(node) => {
                refs.current[index] = node;
              }}
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              data-name={name}
              className={styles.option}
              onClick={() => onChange(key)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.label}>{options[key]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
