import { nums } from './util/nums';

import { third_octave_all, whole_octave_all } from './std/bands';

/**
 * @description Returns the nominal octave band frequencies between a given range (inclusive)
 * @function Octave
 * @param {number} [start] start frequency
 * @param {number} [end] end frequency
 */
export function Octave(start: number, end: number): number[] {
  return whole_octave_all
    .map(x => x.Center)
    .filter(x => x >= Number(start || 0) && x <= Number(end || 20000));
}

/**
 * @description Returns the nominal third octave band frequencies between a given range (inclusive)
 * @function ThirdOctave
 * @param {number} [start] start frequency
 * @param {number} [end] end frequency
 */
export function ThirdOctave(start?: number, end?: number): number[] {
  return third_octave_all
    .map(x => x.Center)
    .filter(x => x >= Number(start || 0) && x <= Number(end || 22000));
}

/**
 * @description Returns the lower band limit of a frequency band
 * @function Flower
 * @param {number} k inverse fraction (i.e. third = 3, sixth = 6, etc.)
 * @param {number | number[]} fc center frequency
 */
export function Flower(k: number, fc: number | number[]) {
  return nums((f: number) => f / Math.pow(2, 1 / (2 * k)), fc) as typeof fc;
}

/**
 * @description Returns the upper band limit of a frequency band
 * @function Fupper
 * @param {number} k inverse fraction (i.e. third = 3, sixth = 6, etc.)
 * @param {number | number[]} fc center frequency
 */
export function Fupper(k: number, fc: number | number[]) {
  return nums((f: number) => f * Math.pow(2, 1 / (2 * k)), fc) as typeof fc;
}

// const Bands = {
//   Octave: {
//     Nominal: whole_octave_all.map(x => x.Center),
//     fromRange: (start: number, end: number): number[] => whole_octave_all.map(x => x.Center).filter(x => x >= Number(start) && x <= Number(end)),
//     withLimits: whole_octave_all,
//   },
//   ThirdOctave: {
//     Nominal: third_octave_all.map(x => x.Center),
//     fromRange: (start: number, end: number): number[] => {
//       return third_octave_all.map(x => x.Center).filter(x => x >= Number(start) && x <= Number(end));
//     },
//     withLimits: third_octave_all
//   },
//   Flower: (k, fc) => {
//     if (typeof fc === "number")
//       fc = [fc];
//     return fc.map(f => f / Math.pow(2, 1 / (2 * k)));
//   },
//   Fupper: (k, fc) => {
//     if (typeof fc === "number")
//       fc = [fc];
//     return fc.map(f => f * Math.pow(2, 1 / (2 * k)));
//   }
// };
