export const STATUSES = ["new", "contacted", "proposed", "contracted", "done", "lost"] as const;
export type Status = (typeof STATUSES)[number];
export function isValidStatus(s: string): s is Status {
  return (STATUSES as readonly string[]).includes(s);
}
export const STATUS_LABELS: Record<Status, string> = {
  new: "접수", contacted: "상담", proposed: "제안", contracted: "계약", done: "완료", lost: "보류",
};
