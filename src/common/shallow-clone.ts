const valueOf = Symbol.prototype.valueOf;
import kindOf from "./kind-of";

export function clone(val) {
  switch (kindOf(val)) {
    case "array":
      return val.slice();
    case "object":
      return Object.assign({}, val);
    case "date":
      return new val.constructor(Number(val));
    case "map":
      return new Map(val);
    case "set":
      return new Set(val);
    case "buffer":
      return cloneBuffer(val);
    case "symbol":
      return cloneSymbol(val);
    case "arraybuffer":
      return cloneArrayBuffer(val);
    case "float32array":
    case "float64array":
    case "int16array":
    case "int32array":
    case "int8array":
    case "uint16array":
    case "uint32array":
    case "uint8clampedarray":
    case "uint8array":
      return cloneTypedArray(val);
    case "regexp":
      return cloneRegExp(val);
    case "error":
      return Object.create(val);
    default: {
      return val;
    }
  }
}

function cloneRegExp(val) {
  const flags = val.flags !== void 0 ? val.flags : /\w+$/.exec(val) || void 0;
  const re = new val.constructor(val.source, flags);
  re.lastIndex = val.lastIndex;
  return re;
}

function cloneArrayBuffer(val) {
  const res = new val.constructor(val.byteLength);
  new Uint8Array(res).set(new Uint8Array(val));
  return res;
}

function cloneTypedArray(val) {
  return new val.constructor(val.buffer, val.byteOffset, val.length);
}

function cloneBuffer(val) {
  const len = val.length;
  const buf = Buffer.allocUnsafe ? Buffer.allocUnsafe(len) : Buffer.from(len);
  val.copy(buf);
  return buf;
}

function cloneSymbol(val) {
  return valueOf ? Object(valueOf.call(val)) : {};
}

export default clone;
