export const between = (min: number, max: number) => (
  value: number
): Boolean => {
  return value <= max && value >= min;
};
