export function discretize(n: number, start: number, stop: number) {
  return function (v: number) {
    return Math.round((stop - start) / n * v);
  }
}