import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeatureChecklist } from "@/components/FeatureChecklist";
import type { Features } from "@/lib/quote/types";

const allFalse: Features = { login:false, pay:false, chat:false, admin:false, noti:false, ai:false, sec:false };

it("7개 모듈 렌더 + 토글 콜백", async () => {
  const onToggle = vi.fn();
  render(<FeatureChecklist value={allFalse} onToggle={onToggle} />);
  expect(screen.getAllByRole("checkbox")).toHaveLength(7);
  await userEvent.click(screen.getByRole("checkbox", { name: /결제/ }));
  expect(onToggle).toHaveBeenCalledWith("pay");
});

it("체크 상태 반영", () => {
  render(<FeatureChecklist value={{ ...allFalse, login: true }} onToggle={() => {}} />);
  expect(screen.getByRole("checkbox", { name: /회원·로그인/ })).toBeChecked();
});
