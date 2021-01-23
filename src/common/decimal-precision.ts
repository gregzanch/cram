export function decimalPrecision(a: number) {
  return Number("." + "1".padStart((Math.trunc(1 / a) - 1).toString().length, "0"));
}

export default decimalPrecision;
