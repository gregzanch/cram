export function max(arr: number[], abs: boolean = false): number {
  if (abs) {
    return arr.reduce((p, c) => {
      if (Math.abs(c) > Math.abs(p)) {
        return c;
      }
      return p;
    }, 0);
  }
  return arr.reduce((p: number, c: number) => {
    if (c > p) {
      return c;
    }
    return p;
  }, 0);
}
