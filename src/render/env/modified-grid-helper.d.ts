import { Color, LineSegments } from "three";

export class ModifiedGridHelper extends LineSegments {
  constructor(size: number, divisions: number, color1?: Color | number, color2?: Color | number, skipFunction: (index: number) => boolean);
  /**
   * @deprecated Colors should be specified in the constructor.
   */
  setColors(color1?: Color | number, color2?: Color | number): void;
}
