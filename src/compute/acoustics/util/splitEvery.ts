export function splitEvery(str: string, n: number) {
  var arr = new Array();
  for (var i = 0; i < str.length; i += n) {
    arr.push(str.substr(i, n));
  }
  return arr;
}
