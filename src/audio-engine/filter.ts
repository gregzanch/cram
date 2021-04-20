/* 

     'filter' returns the solution to the following linear,
     time-invariant difference equation:

           N                   M
          SUM a(k+1) y(n-k) = SUM b(k+1) x(n-k)    for 1<=n<=length(x)
          k=0                 k=0

     where N=length(a)-1 and M=length(b)-1.  The result is calculated
     over the first non-singleton dimension of X or over DIM if
     supplied.

     An equivalent form of the equation is:

                    N                   M
          y(n) = - SUM c(k+1) y(n-k) + SUM d(k+1) x(n-k)  for 1<=n<=length(x)
                   k=1                 k=0

     where c = a/a(1) and d = b/a(1).

*/

import { mod } from "../common/helpers";

export function diracDelta(length: number = 8192, offset: number = 0) {
  const samples = new Float32Array(Array(length).fill(0));
  samples[offset] = 1;
  return samples;
}

const sum = (n: number, N: number, fn: (n: number) => number) => {
  let acc = 0;
  for (let i = n; i <= N; i++) {
    acc += fn(i)
  }
  return acc;
}

export const filter = (b: number[], a: number[], x: Float32Array) => {
  const c = a.map(x => x / a[0]);
  const d = b.map(x => x / a[0]);
  const N = a.length - 1;
  const M = b.length - 1;
  const y = new Float32Array(x.length);
  for (let n = 1; n <= x.length; n++) {
    const index = (k: number) => mod(n - k - 1, y.length);
    y[n - 1] = sum(0, M, (k) => d[k] * x[index(k)]) - sum(1, N, (k) => c[k] * y[index(k)]);
  }
  return y;
}

const { sqrt, cos, sin, sinh, log2, log, PI: pi } = Math;

export function compute_bandpass_biquad_coefficients(low: number, high: number, sampleRate: number) {
  const c = sqrt(low * high);
  const omega = 2 * pi * c / sampleRate;
  const cs = cos(omega);
  const sn = sin(omega);
  const bandwidth = log2(high / low);
  const Q = sn / (log(2) * bandwidth * omega);
  const alpha = sn * sinh(1 / (2 * Q));
  const a0 = 1 + alpha;
  const nrm = 1 / a0;

  return {
    b: [
      nrm * alpha,
      nrm * 0, 
      nrm * -alpha
    ], 
    a: [
      nrm * (1 + alpha),
      nrm * (-2 * cs), 
      nrm * (1 - alpha)
    ]
  };
}



export const coefs = new Map<number, { b: number[], a: number[] }>([
  [31.5, {
    b: [0.00167129498422357, 0, -0.00167129498422357],
    a: [1, -1.996652303137151, 0.996657410031553]
  }],
  [63, {
    b: [0.003319330826213584, 0, -0.003319330826213584],
    a: [1, -1.993341422442351, 0.993361338347572]
  }],
  [125, {
    b: [0.006616771544769954, 0, -0.006616771544769954],
    a: [1, -1.986687056366466, 0.98676645691046]
  }],
  [250, {
    b: [0.01318182446474948, 0, -0.01318182446474948],
    a: [1, -1.973323344053722, 0.973636351070501]
  }],
  [500, {
    b: [0.02602517223074206, 0, -0.02602517223074206],
    a: [1, -1.946713799973245, 0.947949655538516]
  }],
  [1000, {
    b: [0.05076449183647259, 0, -0.05076449183647259],
    a: [1, -1.8936512458672, 0.898471016327055]
  }],
  [2000, {
    b: [0.0968742126179814, 0, -0.0968742126179814],
    a: [1, -1.787879726161113, 0.806251574764037]
  }],
  [4000, {
    b: [0.178326244709022, 0, -0.178326244709022],
    a: [1, -1.576053620216164, 0.643347510581956]
  }],
  [8000, {
    b: [0.312956158171384, 0, -0.312956158171384],
    a: [1, -1.14272700209755, 0.374087683657232]
  }],
  [16000, {
    b: [0.314983642151612, -0.314983642151612],
    a: [1.000000000000000, 0.370032715696775]
  }]
]);