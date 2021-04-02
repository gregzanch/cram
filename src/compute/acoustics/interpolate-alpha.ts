import interpolateLog from './interpolate-log';

export function interpolateAlpha(alpha: number[], freq: number[]): (f: number) => number {
  return function (f: number) {
    let i = 0;
    while (f > freq[i] && i < freq.length) {
      i++;
    }
    if (i > 0 && i<freq.length) {
      const x1 = freq[i - 1];
      const y1 = alpha[i - 1];
      const x2 = freq[i];
      const y2 = alpha[i];
      const xi = f;
      return interpolateLog(x1,y1,x2,y2,xi);
    }
    
    else {
      return i == 0 ? alpha[i] : alpha[freq.length-1];
    }
  }
}



export default interpolateAlpha;