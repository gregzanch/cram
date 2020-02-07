export function allowMultiple(
  func: Function,
  val: number | number[]
): number | number[] {
  if (val instanceof Array) {
    return val.map(x => func(x));
  } else return func(val);
}
