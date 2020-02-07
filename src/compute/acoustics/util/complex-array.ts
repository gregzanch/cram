import { Complex } from '../complex';

export function Float32Array_to_ComplexArray(
  f32_array: Float32Array
): Complex[] {
  return Array.from(f32_array).map(x => new Complex({ real: x, imag: 0 }));
}

export function Float64Array_to_ComplexArray(
  f64_array: Float64Array
): Complex[] {
  return Array.from(f64_array).map(x => new Complex({ real: x, imag: 0 }));
}
