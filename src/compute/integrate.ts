/**
 * numerically integrate a function of x
 * @param {Function} func function to integrate
 * @param {number} a lower bound
 * @param {number} b upper bound
 * @param {number} steps 
 */
export function integrate(func: ((x)=>number), a: number, b: number, steps:number = 100): number {
    let sum = 0;
    let step = (b - a) / steps;
    for (let x = a; x < b; x += step) {
        sum += func(x) * step;
    }
    return sum;
}