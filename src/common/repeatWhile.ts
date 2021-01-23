export type IntervalFunctionArgs = {
  time: number;
  count: number;
};

export function repeatWhile(fn: (args: IntervalFunctionArgs) => boolean, frequency: number): number {
  let t0 = Date.now();
  let count = 0;
  let time = 0;
  let period = 1 / frequency;
  return (setInterval(() => fn({ time, count }), period) as unknown) as number;
}

// repeatWhile(({ count, time }) => {
//   console.log(count);
//   return count > 10;
// }, 10);
