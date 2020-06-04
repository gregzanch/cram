import { linspace } from "./util/linspace";
import complex from "complex";
import randBetween from "./util/rand-between";

const { PI: pi, tanh } = Math;
const coth = (x: number) => 1 / tanh(x);
const ccoth = (x: complex) => new complex(coth(x.real), coth(x.im));

export interface RigidBackedPorousAbsorberParams {
  speed?: number;
  density?: number;
  flowResistivity?: number;
  thickness?: number;
  frequencies?: number[];
}

const defaults = {
  speed: 340,
  density: 1.21,
  flowResistivity: 50000,
  thickness: 0.0254,
  frequencies: linspace(100, 50, 10000)
};

export function rigidBackedPorousAbsorber(params: RigidBackedPorousAbsorberParams) {
  const { speed: c, density: ρ, flowResistivity: σ, thickness: l, frequencies: f } = Object.assign(defaults, params);

  const Z0 = c * ρ;

  // dimensionless quantity for Delany and Bazley
  const X = f.map((f) => (ρ * f) / σ);

  // characteristic impedance
  const zc = X.map((X) => new complex(ρ * c * (1 + 0.0571 * X ** -0.754), ρ * c * (-0.087 * X ** -0.732)));

  // complex wave number
  const k = X.map((X, i) => {
    const multiplier = ((2 * pi) / c) * f[i];
    return new complex(multiplier * +(1 + 0.0978 * X ** -0.7), multiplier * -(0 + 0.189 * X ** -0.595));
  });

  // propogation constant
  const γ = k.map((k) => new complex(-k.im, k.real));

  // surface impedance
  const z = zc.map((zc, i) => zc.clone().mult(ccoth(γ[i].clone().mult(l))));

  // reflection factor
  const R = z.map((z) => {
    // return z.sub(Z0).divide(z.add(Z0));
    let sub = z.clone().sub(Z0);
    let add = z.clone().add(Z0);
    return sub.divide(add);
  });

  // normal incidence absorption coefficient
  const a = R.map((R) => 1 - R.abs() ** 2);

  return {
    frequency: f,
    reflection: {
      magnitude: R.map((R) => R.abs()),
      phase: R.map((R) => R.angle())
    },
    absorption: a
  };
}
