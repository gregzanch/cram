export function map(v, x1, x2, y1, y2) {
  return y1 + (v - x1) / (x2 - x1) * (y2 - y1);
}

export default map;