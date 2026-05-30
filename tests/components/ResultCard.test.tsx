import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultCard } from "@/components/ResultCard";
import type { Selections } from "@/lib/quote/types";

const sel: Selections = {
  platform: "web",
  audience: "internal",
  scale: "small",
  code: "new",
  urgency: "normal",
  feats: { login: true, pay: false, chat: false, admin: false, noti: false, ai: false, sec: false },
};

it("예산대 표시 + 포함 노출", () => {
  render(
    <ResultCard
      result={{ tier: "mvp", consultNeeded: false, budgetLow: 1_000_000, budgetHigh: 2_000_000 }}
      selections={sel}
    />,
  );
  expect(screen.getByText(/100만원 ~ 200만원/)).toBeInTheDocument();
  expect(screen.getByText(/소스코드 전달/)).toBeInTheDocument();
});

it("선택 요약 + 집짓기 비유 + 구간 안내 노출", () => {
  render(
    <ResultCard
      result={{ tier: "mvp", consultNeeded: false, budgetLow: 1_000_000, budgetHigh: 2_000_000 }}
      selections={sel}
    />,
  );
  expect(screen.getByText(/꼭 필요한 핵심/)).toBeInTheDocument();
  expect(screen.getByText(/같은 예산 구간일 수 있어요/)).toBeInTheDocument();
  expect(screen.getByText(/회원·로그인/)).toBeInTheDocument();
});

it("상담필요 분기 — 금액 미표시", () => {
  render(
    <ResultCard
      result={{ tier: "consult", consultNeeded: true, budgetLow: null, budgetHigh: null }}
      selections={sel}
    />,
  );
  expect(screen.getByText("상담 필요")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /상담/ })).toBeInTheDocument();
  expect(screen.queryByText(/만원/)).not.toBeInTheDocument();
});
