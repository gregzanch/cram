import { Solver, SolverParams } from "./solver";
import { BeamParams } from "../geometry/beam";
import { FourierSeries } from "./fourier";
import fixedfree from "./fixed-free";
import { Sum } from "./sum";
const { sqrt, PI: pi, sin, cos, sinh, cosh, abs, round } = Math;

export type funx = (x: number) => number;
export interface TimeParams {
	samplerate: number;
}

export default class BeamSolver {
	params: BeamParams;
	u: (x, t) => number;
	f: (x) => number;
	g: (x) => number;
	ω: Float32Array;
	amplitude: number;
	constructor(params: BeamParams, f: funx, g: funx) {
		this.params = params;
		this.f = f;
		this.g = g;
		this.ω = new Float32Array(Number(this.params.resolution.value));
		const { u, amplitude } = this.solve(f, g);
		this.u = u;
		this.amplitude = amplitude;
	}
	time(params: TimeParams) {
		const T = (2 * pi) / this.ω[0];
		const SR = params.samplerate;

		console.log(T);
	}
	solve(f = this.f, g = this.g) {
		this.f = f;
		this.g = g;
		const N = Number(this.params.resolution.value);
		const L = Number(this.params.length.value);
		const W = Number(this.params.width.value);
		const H = Number(this.params.height.value);
		const M = Number(this.params.mass.value);
		const E = Number(this.params.modulus.value);
		const V = L * W * H;
		const ρ = M / V;
		const I = (W * H ** 3) / 12;
		const β = new Float32Array(N);

		const B = new Float32Array(N);
		const C = new Float32Array(N);
		const A = new Float32Array(N);

		const { a: fa, b: fb } = FourierSeries(f, L, N);
		const { a: ga, b: gb } = FourierSeries(g, L, N);

		console.log(fa, fb);

		const λ = sqrt((E * I) / (ρ * (W * H)));

		const fflen = fixedfree.length;
		let amplitude = 0;
		for (let n = 0; n < N; n++) {
			β[n] = n < fflen ? fixedfree[n] / L : pi / (2 * L) + (pi / L) * n;
			this.ω[n] = β[n] ** 2 * λ;
			amplitude += fa[n] + fb[n];
		}

		const self = this;
		return {
			amplitude,
			u: function(x, t) {
				let u = 0;
				for (let n = 0; n < N; n++) {
					const lx = β[n] * x;
					const lL = β[n] * L;

					const sh = sinh(lx);
					const ch = cosh(lx);

					const s = sin(lx);
					const c = cos(lx);

					const m = (sin(lL) - sinh(lL)) / (cosh(lL) + cos(lL));
					const X = ch - c + m * (sh - s);
					const c1 = fa[n]+ga[n]*2/(pi*(n+1));
					const c2 = fb[n]+gb[n]*2/(pi*(n+1));
					const T = c1 * cos(self.ω[n] * t) + c2 * sin(self.ω[n] * t);

					u += X * T;
				}
				return u;
			}
		};
	}
}
