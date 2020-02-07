/** Energy Density Calculation
 * Architectural Acoustics pg. 64 'Energy Density' Marshal Long, Second Edition
 * @function EnergyDensity
 * @param  {Number} E Energy Contained in a Sound Wave
 * @param  {Number} S Measurement Area
 * @param  {Number} c Speed of Sound
 * @param  {Number} t Time
 * @param  {Number} W Power
 * @param  {Number} I Intensity
 * @param  {Number} p Pressure
 * @param  {Number} rho Bulk Density of Medium
 */
function EnergyDensity({
  E,
  S,
  c,
  t,
  W,
  I,
  p,
  rho,
}: {
  E?: number;
  S?: number;
  c?: number;
  t?: number;
  W?: number;
  I?: number;
  p?: number;
  rho?: number;
}) {
  if (E && S && c && t) {
    return E / (S * c * t);
  } else if (W && S && c) {
    return W / (S * c);
  } else if (I && c) {
    return I / c;
  } else if (p && rho && c) {
    return (p * p) / (rho * c * c);
  } else throw 'Not enough input parameters given';
}
export default EnergyDensity;
