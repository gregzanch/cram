import { integrate } from './integrate';

export interface FourierCoefficients {
    a: Float32Array,
    b: Float32Array;
}

/**
 * finds fourier coefficients a and b for a full fourier series of a function f(x)
 * @param {Function} func function to approximate
 * @param {number} L interval
 * @param {number} N resolution
 * @param {number} M integral resolution
 */
export function FourierSeries(func: ((x) => number), L: number, N: number, M: number = 2 * N): FourierCoefficients  {
    const a = new Float32Array(N + 1);
    const b = new Float32Array(N + 1);
    for (let n = 0; n <= N; n++) {
        a[n] = (1 / L) * integrate(x => func(x) * Math.cos(n * Math.PI * x / L), -L, L, M);
        b[n] = (1 / L) * integrate(x => func(x) * Math.sin(n * Math.PI * x / L), -L, L, M);
    }
    return {
        a,
        b
    };
}
