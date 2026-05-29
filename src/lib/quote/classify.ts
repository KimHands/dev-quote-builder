import type { Selections, Tier, QuoteResult } from "./types";

const BUDGET: Record<Exclude<Tier, "consult">, [number, number]> = {
  landing: [300_000, 600_000],
  mvp: [1_000_000, 2_000_000],
  full: [2_000_000, 4_000_000],
};

const LADDER: Exclude<Tier, "consult">[] = ["landing", "mvp", "full"];

function bumpOne(tier: Exclude<Tier, "consult">): Exclude<Tier, "consult"> {
  const i = LADDER.indexOf(tier);
  return LADDER[Math.min(i + 1, LADDER.length - 1)];
}

function countFeatures(s: Selections): number {
  return Object.values(s.feats).filter(Boolean).length;
}

export function classify(s: Selections): QuoteResult {
  // 1) 상담필요 오버라이드 (최우선)
  if (s.code === "refactor" || s.urgency === "rush" || s.scale === "large") {
    return { tier: "consult", consultNeeded: true, budgetLow: null, budgetHigh: null };
  }

  // 2) 기본 티어 (모듈 수)
  const n = countFeatures(s);
  let tier: Exclude<Tier, "consult"> = n === 0 ? "landing" : n <= 2 ? "mvp" : "full";

  // 3) 상향: 앱은 ① 불가
  if (s.platform === "app" && tier === "landing") tier = "mvp";
  // 3) 상향: 규모=중 → 한 칸
  if (s.scale === "mid") tier = bumpOne(tier);

  // 4) 예산대
  const [low, high] = BUDGET[tier];
  return { tier, consultNeeded: false, budgetLow: low, budgetHigh: high };
}
