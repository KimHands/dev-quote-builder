import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/app/admin/actions", () => ({ updateStatus: vi.fn() }));
import { LeadRow } from "@/components/LeadRow";

const lead = {
  id: "1",
  shareId: "abc123abc123",
  contactName: "홍길동",
  contactChannel: "kakao",
  contactValue: "kid",
  tier: "mvp",
  consultNeeded: false,
  budgetLow: 1_000_000,
  budgetHigh: 2_000_000,
  status: "new",
  createdAt: "2026-05-30T00:00:00.000Z",
};

it("리드 정보 + status 셀렉트", () => {
  render(<LeadRow lead={lead} />);
  expect(screen.getByText(/홍길동/)).toBeInTheDocument();
  expect(screen.getByText(/100만원 ~ 200만원/)).toBeInTheDocument();
  expect(screen.getByRole("combobox")).toBeInTheDocument();
});
