export const argsTag = "[object Arguments]";
export const arrayTag = "[object Array]";
export const asyncTag = "[object AsyncFunction]";
export const boolTag = "[object Boolean]";
export const dateTag = "[object Date]";
export const domExcTag = "[object DOMException]";
export const errorTag = "[object Error]";
export const funcTag = "[object Function]";
export const genTag = "[object GeneratorFunction]";
export const mapTag = "[object Map]";
export const numberTag = "[object Number]";
export const nullTag = "[object Null]";
export const objectTag = "[object Object]";
export const promiseTag = "[object Promise]";
export const proxyTag = "[object Proxy]";
export const regexpTag = "[object RegExp]";
export const setTag = "[object Set]";
export const stringTag = "[object String]";
export const symbolTag = "[object Symbol]";
export const undefinedTag = "[object Undefined]";
export const weakMapTag = "[object WeakMap]";
export const weakSetTag = "[object WeakSet]";
export const arrayBufferTag = "[object ArrayBuffer]";
export const dataViewTag = "[object DataView]";
export const float32Tag = "[object Float32Array]";
export const float64Tag = "[object Float64Array]";
export const int8Tag = "[object Int8Array]";
export const int16Tag = "[object Int16Array]";
export const int32Tag = "[object Int32Array]";
export const uint8Tag = "[object Uint8Array]";
export const uint8ClampedTag = "[object Uint8ClampedArray]";
export const uint16Tag = "[object Uint16Array]";
export const uint32Tag = "[object Uint32Array]";
export const mapIteratorTag = "[object Map Iterator]";
export const setIteratorTag = "[object Set Iterator]";
export const stringIteratorTag = "[object String Iterator]";
export const arrayIteratorTag = "[object Array Iterator]";

/** Used to identify `toStringTag` values of typed arrays. */
export const typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[
  int16Tag
] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[
  uint16Tag
] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[
  boolTag
] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[
  funcTag
] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[
  regexpTag
] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

/** Used to identify `toStringTag` values supported by `_.clone`. */
export const cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[
  dataViewTag
] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[
  float64Tag
] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[
  numberTag
] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[
  stringTag
] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[
  uint16Tag
] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
