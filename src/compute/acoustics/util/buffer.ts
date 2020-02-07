export function buffer(array: any, buffersize: number = 1024): any[][] {
  let subarr: any[] = [];
  return array.reduce((prev: any[], curr: any, i: number) => {
    subarr.push(curr);
    if (i != 0 && i % buffersize == 0) {
      prev.push(subarr);
      subarr = [];
    }
    return prev;
  }, []);
}
