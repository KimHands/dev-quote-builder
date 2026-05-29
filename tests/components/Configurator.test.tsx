import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Configurator } from "@/components/Configurator";

describe("Configurator", () => {
  it("초기 landing 예산대, 결제 추가 시 mvp로 실시간 변경", async () => {
    render(<Configurator />);
    // 초기: feats 0개, web/internal/small/new/normal → landing 30~60만
    expect(screen.getByText(/30만원 ~ 60만원/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: /결제/ }));
    // 모듈 1개 → mvp 100~200만
    expect(screen.getByText(/100만원 ~ 200만원/)).toBeInTheDocument();
  });

  it("리팩토링 선택 시 상담 필요로 분기", async () => {
    render(<Configurator />);
    await userEvent.click(screen.getByRole("radio", { name: /기존 코드 개선/ }));
    expect(screen.getByText("상담 필요")).toBeInTheDocument();
    expect(screen.queryByText(/만원/)).not.toBeInTheDocument();
  });
});
