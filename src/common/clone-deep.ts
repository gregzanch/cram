import clone from "./shallow-clone";
import kindOf from "./kind-of";
import isPlainObject from "./is-plain-object";

export function cloneDeep(val, instanceClone) {
  switch (kindOf(val)) {
    case "object":
      return cloneObjectDeep(val, instanceClone);
    case "array":
      return cloneArrayDeep(val, instanceClone);
    default: {
      return clone(val);
    }
  }
}

export function cloneObjectDeep(val, instanceClone) {
  if (typeof instanceClone === "function") {
    return instanceClone(val);
  }
  if (instanceClone || isPlainObject(val)) {
    const res = new val.constructor();
    for (let key in val) {
      res[key] = cloneDeep(val[key], instanceClone);
    }
    return res;
  }
  return val;
}

export function cloneArrayDeep(val, instanceClone) {
  const res = new val.constructor(val.length);
  for (let i = 0; i < val.length; i++) {
    res[i] = cloneDeep(val[i], instanceClone);
  }
  return res;
}

export default cloneDeep;
