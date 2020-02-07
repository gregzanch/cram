interface WallElement {
  tau?: number;
  area: number;
  TL?: number;
}

import { tau } from './tau';

export function compositeTL(wallElements: WallElement[]): number {
  let num = wallElements
    .map((elt: WallElement): number => elt.area)
    .reduce((a: number, b: number): number => a + b);
  let den = wallElements
    .map((elt: WallElement): number => elt.tau || tau(elt.TL || 0) * elt.area)
    .reduce((a: number, b: number): number => a + b);
  return 10 * Math.log10(num / den);
}
