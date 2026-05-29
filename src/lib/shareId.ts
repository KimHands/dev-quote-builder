import { customAlphabet } from "nanoid";

// 헷갈리는 문자(0/O/1/l/I) 제외, 12자 — 추측불가·URL 안전 (ADR 0008)
const nano = customAlphabet("23456789abcdefghijkmnpqrstuvwxyz", 12);

export function newShareId(): string {
  return nano();
}
