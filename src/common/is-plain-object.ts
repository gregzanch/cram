export function isPlainObject(o) {
  if (Object.prototype.toString.call(o) !== "[object Object]") return false;

  // If has modified constructor
  let ctor = o.constructor;
  if (ctor === undefined) return true;

  // If has modified prototype
  let prot = ctor.prototype;
  if (Object.prototype.toString.call(o) !== "[object Object]") return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty("isPrototypeOf") === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

export default isPlainObject;
