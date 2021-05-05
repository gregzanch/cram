/**
 * Rounds a number to a certain precision
 * @param value value to round
 * @param places number of decimal places (can be negative)
 * @returns the rounded number
 * 
 * @example
 * ```ts
 * const value = 3.1415926
 * const places = 2
 * roundTo(value, places) // 3.14
 * ```
 * 
 * @example
 * ```ts
 * const value = 1492
 * const places = -2
 * roundTo(value, places) // 1500
 * ```
 */

export default function roundTo(value: number, places: number = 0): number{
  const mult = 10 ** places;
  return Math.round(value * mult) / mult;
}