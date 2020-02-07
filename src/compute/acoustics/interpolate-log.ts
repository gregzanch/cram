export function interpolateLog(x1, y1, x2, y2, xi) {
  return y1 + (Math.log10(xi) - Math.log10(x1)) / (Math.log10(x2) - Math.log10(x1)) * (y2 - y1);
}

export default interpolateLog;