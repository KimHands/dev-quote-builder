import { it, expect } from "vitest";
import { isAdmin } from "@/lib/authz";
it("admin role이면 true", () => {
  expect(isAdmin({ user: { role: "admin" } } as never)).toBe(true);
});
it("user/누락이면 false", () => {
  expect(isAdmin({ user: { role: "user" } } as never)).toBe(false);
  expect(isAdmin(null)).toBe(false);
  expect(isAdmin({ user: {} } as never)).toBe(false);
});
