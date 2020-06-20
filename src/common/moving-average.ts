import {ArrayLike} from './array-like';

export function movingAverage(arr: ArrayLike, n: number = 1) {
  let movingAverage = arr.slice();

  for (let i = 0; i < arr.length; i++) {
    if (i >= n && i < arr.length - n) {
      const ti = i - n;
      const tf = i + n;
      let sum = 0;
      for (let j = ti; j < tf; j++) {
        sum += arr[j];
      }
      movingAverage[i] = sum / (2 * n);
    }
  }
  return movingAverage;
}

