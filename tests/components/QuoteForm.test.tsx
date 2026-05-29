import { it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuoteForm } from "@/components/QuoteForm";
import type { Selections } from "@/lib/quote/types";

const selections: Selections = {
  platform:"web", audience:"internal", scale:"small", code:"new", urgency:"normal",
  feats:{ login:true, pay:false, chat:false, admin:false, noti:false, ai:false, sec:false },
};

beforeEach(() => { vi.restoreAllMocks(); });
afterEach(() => { vi.restoreAllMocks(); });

it("제출 시 올바른 payload로 fetch + 공유링크 표시", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true, status: 201, json: async () => ({ shareId: "abc123abc123" }),
  });
  vi.stubGlobal("fetch", fetchMock);

  render(<QuoteForm selections={selections} />);
  await userEvent.type(screen.getByLabelText(/이름/), "홍길동");
  await userEvent.type(screen.getByLabelText(/연락처/), "kakao_id");
  await userEvent.click(screen.getByRole("button", { name: /제출|보내기|문의/ }));

  expect(fetchMock).toHaveBeenCalledOnce();
  const [url, opts] = fetchMock.mock.calls[0];
  expect(url).toBe("/api/quotes");
  const body = JSON.parse(opts.body);
  expect(body.contactName).toBe("홍길동");
  expect(body.selections).toEqual(selections);
  expect(body).not.toHaveProperty("budgetLow");
  expect(body).not.toHaveProperty("tier");
  expect(await screen.findByText(/abc123abc123/)).toBeInTheDocument();
});

it("실패 시 에러 표시 + 입력 보존", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok:false, status:400, json: async () => ({ error:"bad" }) });
  vi.stubGlobal("fetch", fetchMock);
  render(<QuoteForm selections={selections} />);
  await userEvent.type(screen.getByLabelText(/이름/), "홍길동");
  await userEvent.type(screen.getByLabelText(/연락처/), "kakao_id");
  await userEvent.click(screen.getByRole("button", { name: /제출|보내기|문의/ }));
  expect(await screen.findByText(/다시|오류|실패/)).toBeInTheDocument();
  expect(screen.getByLabelText(/이름/)).toHaveValue("홍길동"); // 입력 보존
});
