export const range = (n: number) => {
  return Array(n)
    .fill(0)
    .map((_: number, i: number) => i);
};

