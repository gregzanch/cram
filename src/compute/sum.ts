/**
 * sum
 * @param a lower bound
 * @param b upper bound
 * @param cb function
 */
export function Sum(a: number, b: number, cb: ((x: number) => number)) {
	let sum = 0;
	for (let n = a; n < b; n++) {
		sum += cb(n);
	}
	return sum;
};
