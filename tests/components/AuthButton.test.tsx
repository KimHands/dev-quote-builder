import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));
import { useSession } from "next-auth/react";
import { AuthButton } from "@/components/AuthButton";

it("비로그인: 카카오 로그인 버튼", () => {
  vi.mocked(useSession).mockReturnValue({ data: null, status: "unauthenticated" } as never);
  render(<AuthButton />);
  expect(screen.getByRole("button", { name: /카카오|로그인/ })).toBeInTheDocument();
});

it("로그인: 로그아웃 버튼", () => {
  vi.mocked(useSession).mockReturnValue({ data: { user: { name: "홍길동" } }, status: "authenticated" } as never);
  render(<AuthButton />);
  expect(screen.getByRole("button", { name: /로그아웃/ })).toBeInTheDocument();
});
