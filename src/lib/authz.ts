import type { Session } from "next-auth";

export function isAdmin(session: Session | null): boolean {
  return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export function assertAdmin(session: Session | null): void {
  if (!isAdmin(session)) throw new Error("forbidden: admin only");
}
