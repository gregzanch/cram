/** Rectangular window
 * @function Rectangular
 * @param  {number} N Length of the window
 * @returns {number[]} a Rectangular window of length N
 */
export const Rectangular = (N: number): number[] => {
  return Array(N).fill(1);
};
