import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
vi.mock("next-auth/react", () => ({ useSession: vi.fn(), signIn: vi.fn() }));
import { useSession } from "next-auth/react";
import { AiParser } from "@/components/AiParser";

it("비로그인: 값 미리보기 + 로그인 CTA", () => {
  vi.mocked(useSession).mockReturnValue({ data: null, status: "unauthenticated" } as never);
  render(<AiParser />);
  expect(screen.getByText(/미리보기|예시/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /카카오|로그인/ })).toBeInTheDocument();
});

it("로그인: 입력창(textbox)", () => {
  vi.mocked(useSession).mockReturnValue({ data: { user: { name: "홍" } }, status: "authenticated" } as never);
  render(<AiParser />);
  expect(screen.getByRole("textbox")).toBeInTheDocument();
});
