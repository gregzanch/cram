import { sum } from './sum';

export function db_add(values: Array<number>): number {
  let s = sum(values.map(x => Math.pow(10, x / 10)));
  return 10 * Math.log10(s);
}
