import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultCard } from "@/components/ResultCard";

it("예산대 표시 + 포함 노출", () => {
  render(<ResultCard result={{ tier:"mvp", consultNeeded:false, budgetLow:1_000_000, budgetHigh:2_000_000 }} />);
  expect(screen.getByText(/100만원 ~ 200만원/)).toBeInTheDocument();
  expect(screen.getByText(/소스코드 전달/)).toBeInTheDocument();
});

it("상담필요 분기 — 금액 미표시", () => {
  render(<ResultCard result={{ tier:"consult", consultNeeded:true, budgetLow:null, budgetHigh:null }} />);
  expect(screen.getByText("상담 필요")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /상담/ })).toBeInTheDocument();
  expect(screen.queryByText(/만원/)).not.toBeInTheDocument();
});
