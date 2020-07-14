

export function equalWithinTolerenceFactory<T>(keys?: string[]) {
  if (keys) {
    return (tolerence: number) => (v1: T, v2: T) => {
      return keys.reduce((accum: boolean, key: string) => Math.abs(v1[key] - v2[key]) < tolerence, true);
    };
  }
  return (tolerence: number) => (v1: number, v2: number) => {
    return Math.abs(v1 - v2) < tolerence;
  };
}

export const numbersEqualWithinTolerence = equalWithinTolerenceFactory<number>();


