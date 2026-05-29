export function won(n: number): string {
  return `${(n / 10_000).toLocaleString("ko-KR")}만원`;
}
export function wonRange(low: number, high: number): string {
  return `${won(low)} ~ ${won(high)}`;
}
