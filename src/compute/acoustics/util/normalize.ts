
export function normalize<T>(arr: T) {
  let _max = arr[0];
  //@ts-ignore
  for (let i = 1; i < arr.length; i++){
    if (Math.abs(arr[i] as number) > _max) {
      _max = Math.abs(arr[i] as number);
    }
  }
  if (_max != 0) {
    //@ts-ignore
    for (let i = 0; i < arr.length; i++) {
      arr[i] = (arr[i] as number) / (_max as number);
    }
  }
  return arr as T;
}
