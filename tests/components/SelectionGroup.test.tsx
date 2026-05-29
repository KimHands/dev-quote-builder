import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectionGroup } from "@/components/SelectionGroup";

const opts = { web: "웹사이트", app: "모바일 앱" };
it("선택지 렌더 + 클릭 시 콜백", async () => {
  const onChange = vi.fn();
  render(<SelectionGroup legend="어디서?" options={opts} value="web" onChange={onChange} name="platform" />);
  expect(screen.getByRole("radiogroup", { name: "어디서?" })).toBeInTheDocument();
  const app = screen.getByRole("radio", { name: "모바일 앱" });
  expect(screen.getByRole("radio", { name: "웹사이트" })).toHaveAttribute("aria-checked", "true");
  await userEvent.click(app);
  expect(onChange).toHaveBeenCalledWith("app");
});
