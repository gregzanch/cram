/**
 * calculates the speed of sound in m/s
 * @param temperature temperature in °C
 * @returns speed of sound in m/s
 */
export function soundSpeed(temperature: number): number {
  return 20.05 * Math.sqrt(temperature + 273.15);
}