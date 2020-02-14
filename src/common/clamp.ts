export function clamp(v, a, b) {
  return v < a ? a : v > b ? b : v;
}