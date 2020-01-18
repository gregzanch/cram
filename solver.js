const { sqrt, sin, cos, sinh, cosh, tanh, sign, round, PI, abs } = Math;
const pi = PI;

/** Solves the wave equation for a beam
 *
 * @param {number} N Number of modes
 * @param {number} L Length
 * @param {number} W Width
 * @param {number} H Height
 * @param {number} M Mass
 * @param {number} E Modulus of Elasticity
 * @returns {(x: number,t: number) => number} u
 */
function solve(N, L, W, H, M, E) {
	const A = W * H;
	const I = (W * H ** 3) / 12;
	const rho = M / (L * W * H);
	const lambda = roots(N).map(x => x / L);
	const omega = new Float32Array(N);
	const A1 = new Float32Array(N);
	const f = new Float32Array(N);

	const C1 = 0;
	const C2 = 2.4;

	// precomputed values to avoid un-necessary computation
	const G1 = sqrt((E * I) / (rho * A));
	const G2 = 1 / L;
	const G3 = pi / 2;
	const G4 = pi / L;
	const G5 = pi / (2 * L);
	const G6 = 2 * pi;
	const G7 = G1 / G6;

	for (let n = 0; n < N; n++) {
		f[n] = lambda[n] ** 2 * G7;
		A1[n] = 1 / (n + 1);
	}

	const $A1 = (x, n) => A1[n] * (sinh(lambda[n] * x) - sin(lambda[n] * x));
	const $A2 = (x, n) => A1[n] * (cosh(lambda[n] * x) - cos(lambda[n] * x));

	const $C1 = (t, n) => C1 * cos(omega[n] * t);
	const $C2 = (t, n) => C2 * sin(omega[n] * t);

	const $A = (x, n) => $A1(x, n) - $A2(x, n);
	const $C = (t, n) => $C1(t, n) + $C2(t, n);

	const u = (x, t) => Sum(0, N, n => $A(x, n) * $C(t, n));

	return {
		u,
		f
	};
}

function Sum(a, b, f) {
	let sum = 0;
	for (let n = a; n < b; n++) {
		sum += f(n);
	}
	return sum;
}

function roots(N) {
	let x = [
		1.87510406871196,
		4.69409113297417,
		7.85475743823761,
		10.9955407348755
	];
	let arr = new Array(N);
	for (let n = 0; n < N; n++) {
		if (n < x.length) {
			arr[n] = x[n];
		} else {
			arr[n] = (n + 1) * pi - pi / 2;
		}
	}
	return arr;
}

const exa = 1e18;
const peta = 1e15;
const tera = 1e12;
const giga = 1e9;
const mega = 1e6;
const kilo = 1e3;
const hecto = 1e2;
const deka = 1e1;
const deci = 1e-1;
const centi = 1e-2;
const milli = 1e-3;
const micro = 1e-6;
const nano = 1e-9;
const pico = 1e-12;
const femto = 1e-15;
const atto = 1e-18;

let N = 50;
let E = 200*giga;

const ρ = 7800;

const L = 0.8334375;
const W = 73.69 * milli;
const H = 2.46 * milli;
const V = L * W * H;

let M = ρ * V;

let freq = solve(N, L, W, H, M, E).f;




console.log(Array.from(freq).map(x => Math.round(x*1e2)/1e2));
