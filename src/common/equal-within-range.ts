

export function equalWithinTolerenceFactory(keys?: string[]) {
  if (keys) {
    return (tolerence: number) => (v1, v2) => {
      return keys.reduce((accum: boolean, key: string) => Math.abs(v1[key] - v2[key]) < tolerence, true);
    };
  }
  return (tolerence: number) => (v1, v2) => {
    return Math.abs(v1 - v2) < tolerence;
  };
}

export const numbersEqualWithinTolerence = equalWithinTolerenceFactory();


