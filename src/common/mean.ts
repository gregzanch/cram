import {ArrayLike} from './array-like';

export function mean(arr: ArrayLike) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++){
    sum += arr[i];
  }
  return sum/arr.length;
}