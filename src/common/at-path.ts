export function atPath(path: Array<number | string>, object: any): undefined | any {
  let obj = object;
  for (const key of path) {
    if (obj.hasOwnProperty(key)) {
      obj = obj[key];
    } else {
      return undefined;
    }
  }
  return obj;
}

export default atPath;
