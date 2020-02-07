export function transpose(array: any): any {
  return array[0].map((_: any, i: number) => array.map((row: any) => row[i]));
}
