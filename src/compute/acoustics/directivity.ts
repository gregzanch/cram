export function directivityIndex(Q: number): number {
  return 10 * Math.log10(Q);
}

export function Q(a: number, b: number): number {
  return 180 / Math.asin(Math.sin(a / 2) * Math.cos(b / 2));
}
