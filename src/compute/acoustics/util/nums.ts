export function nums(f: Function, v: number | number[]): number | number[] {
  if (typeof v === 'number') {
    return f(v);
  } else {
    return v.map(x => f(x));
  }
}
