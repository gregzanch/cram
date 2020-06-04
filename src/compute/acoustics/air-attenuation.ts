/**
 * 
 * @param {number[]} frequency  frequency in Hz
 * @param {number} temperature temperature in °C (20°C)
 * @param {number} humidity relative humidity in % (40%)
 * @param {number} pressure atmospheric pressure in Pa (101325 Pa)
 * @returns {number[]} db per m attenuation
 * @see http://en.wikibooks.org/wiki/Engineering_Acoustics/Outdoor_Sound_Propagation
 */
export function airAttenuation(
  frequency: number[],
  temperature: number = 20,
  humidity: number = 40,
  pressure: number = 101325
): number[] {
  const T = temperature + 273.15;
  const T0 = 293.15;
  const T01 = 273.16;

  const ps0 = 1.01325e5;
  const ps: number = pressure || ps0;

  const Csat = -6.8346 * Math.pow(T01 / T, 1.261) + 4.6151;
  const rhosat = Math.pow(10, Csat);
  const H = (rhosat * humidity * ps0) / ps;

  const frn = (ps / ps0) * Math.pow(T0 / T, 0.5) * (9 + 280 * H * Math.exp(-4.17 * (Math.pow(T0 / T, 1 / 3) - 1)));
  const fro = (ps / ps0) * (24.0 + (4.04e4 * H * (0.02 + H)) / (0.391 + H));

  const alphas: number[] = [];
  frequency.forEach(f => {
    const alpha = f ** 2 * (1.84e-11 / ((Math.pow(T0 / T, 0.5) * ps) / ps0) + Math.pow(T0 / T, -2.5) * ((0.1068 * Math.exp(-3352 / T) * frn) / (f * f + frn * frn) + (0.01278 * Math.exp(-2239.1 / T) * fro) / (f * f + fro * fro)));
    alphas.push((20 * alpha) / Math.log(10));
  });

  return alphas;
}
