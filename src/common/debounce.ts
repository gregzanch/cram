// from libdom
declare function setTimeout(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;

export const debounce = <T extends (...args: any) => any>(fn: T, freq: number = 60) => {
  const period = 1000 / freq;
  let lastCall = 0;
  let timeout: number | null = null;
  const setLastCall = (time: number) => {
    lastCall = time;
    timeout = null;
  };
  return ((...args) => {
    const time = Date.now();

    // time since the last call
    const dt = time - lastCall;

    // time remaining in the interval
    const timeRemaining = period - dt;

    if (timeRemaining <= 0) {
      fn(...args);
      setLastCall(time);
    } else {
      // clear the previous timeout
      if (timeout) clearTimeout(timeout);

      // set the new timeout
      timeout = setTimeout(() => {
        fn(...args);
        setLastCall(Date.now());
      }, timeRemaining);
    }
  }) as T;
};

export default debounce;
