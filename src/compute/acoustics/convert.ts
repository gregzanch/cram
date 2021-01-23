import { allowMultiple } from "./util/allowMultiple";
import { pref, Wref, Iref } from "./std/constants";

/**
 * Convert sound power level to sound pressure level
 * @param Lw sound power level
 * @param r radius
 * @param Q directivity
 */
export function Lw2Lp(Lw: number | number[], r: number = 1, Q: number = 1): number | number[] {
  return allowMultiple((x: number) => x - Math.abs(10 * Math.log10(Q / (4 * Math.PI * r * r))), Lw);
}

/**
 * Convert sound pressure level to sound power level
 * @param Lp sound pressure level
 * @param r radius
 * @param Q directivity
 */
export function Lp2Lw(Lp: number | number[], r: number = 1, Q: number = 1): number | number[] {
  return allowMultiple((x: number) => Math.abs(10 * Math.log10(Q / (4 * Math.PI * r * r))) + x, Lp);
}

/**
 * Convert pressure to sound pressure level
 * @param P pressure
 */
export function P2Lp(P: number | number[]): number | number[] {
  return allowMultiple((p: number) => 20 * Math.log10(p / pref.value), P);
}
/**
 * Convert sound pressure level to pressure
 * @param Lp sound pressure level
 */
export function Lp2P(Lp: number | number[]): number | number[] {
  return allowMultiple((lp: number) => 10 ** (lp / 20) * pref.value, Lp);
}

/**
 * Convert Intensity to sound intensity level
 * @param I Intensity
 */
export function I2Li(I: number | number[]): number | number[] {
  return allowMultiple((i: number) => 10 * Math.log10(i / Iref.value), I);
}
/**
 * Convert sound intensity level to Intensity
 * @param Li sound intensity level
 */
export function Li2I(Li: number | number[]): number | number[] {
  return allowMultiple((li: number) => Math.pow(10, li / 10) * Iref.value, Li);
}

/**
 * Convert Power to sound power level
 * @param W Power
 */
export function W2Lw(W: number | number[]): number | number[] {
  return allowMultiple((w: number) => 10 * Math.log10(w / Wref.value), W);
}
/**
 * Convert sound power level to Power
 * @param Lw sound power level
 */
export function Lw2W(Lw: number | number[]): number | number[] {
  return allowMultiple((lw: number) => Math.pow(10, lw / 10) * Wref.value, Lw);
}
/**
 *
 * @param p pressure in Pa
 * @param z0 specific acoustic impedance (400 N·s/m3 for air)
 */
export function P2I(p: number | number[], z0: number = 400): number | number[] {
  return allowMultiple((p: number) => p ** 2 / z0, p);
}

/**
 *
 * @param I intensity in W/m^2
 * @param z0 specific acoustic impedance (400 N·s/m^3 for air)
 */
export function I2P(I: number | number[], z0: number = 400): number | number[] {
  return allowMultiple((I: number) => Math.sqrt(I * z0), I);
}

export function Lp2Ln(Lp: number | number[], Ar: number, Ao: number = 108): number | number[] {
  return allowMultiple((lp: number) => lp - 10 * Math.log10(Ao / Ar), Lp);
}
