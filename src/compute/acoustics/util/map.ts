export function map(
  v: number,
  l1: number,
  l2: number,
  h1: number,
  h2: number
): number {
  return l2 + ((v - l1) * (h2 - l2) / (h1 - l1));
}
