import {ArrayLike} from './array-like';

import { linearRegression as _linearRegression } from 'simple-statistics';


export interface LinearRegressionResult{
  m: number;
  b: number;
  fx: (x: number) => number;
  fy: (y: number) => number;
}

export function linearRegression(xs: ArrayLike, ys: ArrayLike): LinearRegressionResult {
  const n = xs.length;
  
  const tuples = [] as number[][];
  for (let i = 0; i < n; i++){
    tuples.push([xs[i], ys[i]]);
  }
  
  const { m, b } = _linearRegression(tuples);
  
  
  const fx = (x: number) => m * x + b;
  const fy = (y: number) => (y - b) / m;
  return { m, b, fx, fy };
  
}


export default linearRegression;
