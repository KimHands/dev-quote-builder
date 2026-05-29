"use client";

import { useState } from "react";
import type { Selections, FeatureKey } from "@/lib/quote/types";
import { classify } from "@/lib/quote/classify";
import { AXIS_LABELS, OPTION_LABELS } from "@/lib/quote/labels";
import { SelectionGroup } from "./SelectionGroup";
import { FeatureChecklist } from "./FeatureChecklist";
import { ResultCard } from "./ResultCard";
import { QuoteForm } from "./QuoteForm";
import styles from "./Configurator.module.css";

const DEFAULT_SELECTIONS: Selections = {
  platform: "web",
  audience: "internal",
  scale: "small",
  code: "new",
  urgency: "normal",
  feats: { login: false, pay: false, chat: false, admin: false, noti: false, ai: false, sec: false },
};

export function Configurator() {
  const [selections, setSelections] = useState<Selections>(DEFAULT_SELECTIONS);

  const toggleFeature = (key: FeatureKey) =>
    setSelections((s) => ({ ...s, feats: { ...s.feats, [key]: !s.feats[key] } }));

  const result = classify(selections);

  return (
    <div className={styles.layout}>
      <div className={styles.settings}>
        <SelectionGroup
          legend={AXIS_LABELS.platform}
          options={OPTION_LABELS.platform}
          value={selections.platform}
          onChange={(v) => setSelections((s) => ({ ...s, platform: v }))}
          name="platform"
        />
        <SelectionGroup
          legend={AXIS_LABELS.audience}
          options={OPTION_LABELS.audience}
          value={selections.audience}
          onChange={(v) => setSelections((s) => ({ ...s, audience: v }))}
          name="audience"
        />
        <SelectionGroup
          legend={AXIS_LABELS.scale}
          options={OPTION_LABELS.scale}
          value={selections.scale}
          onChange={(v) => setSelections((s) => ({ ...s, scale: v }))}
          name="scale"
        />
        <SelectionGroup
          legend={AXIS_LABELS.code}
          options={OPTION_LABELS.code}
          value={selections.code}
          onChange={(v) => setSelections((s) => ({ ...s, code: v }))}
          name="code"
        />
        <SelectionGroup
          legend={AXIS_LABELS.urgency}
          options={OPTION_LABELS.urgency}
          value={selections.urgency}
          onChange={(v) => setSelections((s) => ({ ...s, urgency: v }))}
          name="urgency"
        />
        <FeatureChecklist value={selections.feats} onToggle={toggleFeature} />
      </div>

      <div className={styles.result}>
        <ResultCard result={result} />
        <QuoteForm selections={selections} />
      </div>
    </div>
  );
}
