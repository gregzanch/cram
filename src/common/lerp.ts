import { Vector3 } from 'three';

export function lerp(a: number, b: number, amt: number) {
  return a + (b - a) * amt;
}

export function lerp3(a: Vector3, b: Vector3, amt: number) {
  return new Vector3(
		lerp(a.x, b.x, amt),
		lerp(a.y, b.y, amt),
		lerp(a.z, b.z, amt)
  );
}