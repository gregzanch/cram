import { range } from './range';
export const chunk = (n: number) => (arr: any[]) => {
  return range(Math.ceil(arr.length / n)).map((_: number, i: number) =>
    arr.slice(i * n, i * n + n)
  );
};
