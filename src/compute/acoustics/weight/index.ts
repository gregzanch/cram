function R_a(f: number): number {
  const f2: number = f * f;
  const f4: number = f2 * f2;
  return (
    (148693636 * f4) /
    ((f2 + 424.36) *
      Math.sqrt((f2 + 11599.29) * (f2 + 544496.41)) *
      (f2 + 148693636))
  );
}

export function A(f: number[]): number[] {
  return f.map((freq: number) => 20 * Math.log10(R_a(freq)) + 2.0);
}

function R_b(f: number): number {
  const f2: number = f * f;
  const f3: number = f * f * f;
  return (
    (148693636 * f3) /
    ((f2 + 424.36) * Math.sqrt(f2 + 24964) * (f2 + 148693636))
  );
}

export function B(f: number[]): number[] {
  return f.map((freq: number) => 20 * Math.log10(R_b(freq)) + 0.17);
}

function R_c(f: number): number {
  const f2: number = f * f;
  return (148693636 * f2) / ((f2 + 424.36) * (f2 + 148693636));
}

export function C(f: number[]): number[] {
  return f.map((freq: number) => 20 * Math.log10(R_c(freq)) + 0.06);
}

function h(f: number): number {
  const f2: number = f * f;
  return (
    (Math.pow(1037918.48 - f2, 2) + 1080768.16 * f2) /
    (Math.pow(9837328 - f2, 2) + 11723776 * f2)
  );
}
function R_d(f: number): number {
  const f2: number = f * f;
  return (
    f *
    14499.711699348261 *
    Math.sqrt(h(f) / ((f2 + 79919.29) * (f2 + 1345600)))
  );
}

export function D(f: number[]): number[] {
  return f.map((freq: number) => 20 * Math.log10(R_d(freq)));
}
