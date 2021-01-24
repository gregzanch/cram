// import { isObjectLike } from "lodash";
// import {
//   funcTag,
//   genTag,
//   asyncTag,
//   proxyTag,
//   dataViewTag,
//   arrayBufferTag,
//   boolTag,
//   dateTag,
//   numberTag,
//   errorTag,
//   regexpTag,
//   stringTag,
//   mapTag,
//   setTag,
//   symbolTag,
//   undefinedTag,
//   nullTag,
//   arrayTag,
//   argsTag,
//   objectTag,
//   typedArrayTags
// } from "../constants/tags";

// import { MAX_SAFE_INTEGER, LARGE_ARRAY_SIZE } from "../constants/numbers";
// import { COMPARE_PARTIAL_FLAG, COMPARE_UNORDERED_FLAG } from "../constants/flags";

// const nativeGetSymbols = Object.getOwnPropertySymbols;

// /**
//  * A specialized version of `_.filter` for arrays without support for
//  * iteratee shorthands.
//  *
//  * @private
//  * @param {Array} [array] The array to iterate over.
//  * @param {Function} predicate The function invoked per iteration.
//  * @returns {Array} Returns the new filtered array.
//  */
// function arrayFilter(array, predicate) {
//   var index = -1,
//     length = array == null ? 0 : array.length,
//     resIndex = 0,
//     result = [] as any[];

//   while (++index < length) {
//     var value = array[index];
//     if (predicate(value, index, array)) {
//       result[resIndex++] = value;
//     }
//   }
//   return result;
// }

// /**
//  * Appends the elements of `values` to `array`.
//  *
//  * @private
//  * @param {Array} array The array to modify.
//  * @param {Array} values The values to append.
//  * @returns {Array} Returns `array`.
//  */
// function arrayPush(array, values) {
//   var index = -1,
//     length = values.length,
//     offset = array.length;

//   while (++index < length) {
//     array[offset + index] = values[index];
//   }
//   return array;
// }

// /**
//  * Creates an array of the own enumerable symbols of `object`.
//  *
//  * @private
//  * @param {Object} object The object to query.
//  * @returns {Array} Returns the array of symbols.
//  */
// var getSymbols = !nativeGetSymbols
//   ? stubArray
//   : function (object) {
//       if (object == null) {
//         return [];
//       }
//       object = Object(object);
//       return arrayFilter(nativeGetSymbols(object), function (symbol) {
//         return propertyIsEnumerable.call(object, symbol);
//       });
//     };

// /**
//  * Creates an array of the own and inherited enumerable symbols of `object`.
//  *
//  * @private
//  * @param {Object} object The object to query.
//  * @returns {Array} Returns the array of symbols.
//  */
// var getSymbolsIn = !nativeGetSymbols
//   ? stubArray
//   : function (object) {
//       var result = [];
//       while (object) {
//         arrayPush(result, getSymbols(object));
//         object = getPrototype(object);
//       }
//       return result;
//     };

// /**
//  * Converts `func` to its source code.
//  *
//  * @private
//  * @param {Function} func The function to convert.
//  * @returns {string} Returns the source code.
//  */
// function toSource(func) {
//   if (func != null) {
//     try {
//       return Function.prototype.toString.call(func);
//     } catch (e) {}
//     try {
//       return func + "";
//     } catch (e) {}
//   }
//   return "";
// }

// function isFunction(value) {
//   if (!isObject(value)) {
//     return false;
//   }
//   // The use of `Object#toString` avoids issues with the `typeof` operator
//   // in Safari 9 which returns 'object' for typed arrays and other constructors.
//   var tag = baseGetTag(value);
//   return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
// }
// function eq(value, other) {
//   return value === other || (value !== value && other !== other);
// }

// /**
//  * Gets the index at which the `key` is found in `array` of key-value pairs.
//  *
//  * @private
//  * @param {Array} array The array to inspect.
//  * @param {*} key The key to search for.
//  * @returns {number} Returns the index of the matched value, else `-1`.
//  */
// function assocIndexOf(array, key) {
//   var length = array.length;
//   while (length--) {
//     if (eq(array[length][0], key)) {
//       return length;
//     }
//   }
//   return -1;
// }

// function isObject(value) {
//   var type = typeof value;
//   return value != null && (type == "object" || type == "function");
// }

// /**
//  * Gets the value at `key` of `object`.
//  *
//  * @private
//  * @param {Object} [object] The object to query.
//  * @param {string} key The key of the property to get.
//  * @returns {*} Returns the property value.
//  */
// function getValue(object, key) {
//   return object == null ? undefined : object[key];
// }

// const HASH_UNDEFINED = "HASH_UNDEFINED";
// const nativeCreate = Object.create;

// /**
//  * Creates a hash object.
//  *
//  * @private
//  * @constructor
//  * @param {Array} [entries] The key-value pairs to cache.
//  */
// function Hash(entries?) {
//   let index = -1;
//   let length = entries == null ? 0 : entries.length;

//   this.clear();
//   while (++index < length) {
//     var entry = entries[index];
//     this.set(entry[0], entry[1]);
//   }
// }

// /*------------------------------------------------------------------------*/

// /**
//  * Creates an list cache object.
//  *
//  * @private
//  * @constructor
//  * @param {Array} [entries] The key-value pairs to cache.
//  */
// function ListCache(entries?) {
//   var index = -1,
//     length = entries == null ? 0 : entries.length;

//   this.clear();
//   while (++index < length) {
//     var entry = entries[index];
//     this.set(entry[0], entry[1]);
//   }
// }

// /**
//  * Removes all key-value entries from the list cache.
//  *
//  * @private
//  * @name clear
//  * @memberOf ListCache
//  */
// function listCacheClear() {
//   this.__data__ = [];
//   this.size = 0;
// }

// /**
//  * Removes `key` and its value from the list cache.
//  *
//  * @private
//  * @name delete
//  * @memberOf ListCache
//  * @param {string} key The key of the value to remove.
//  * @returns {boolean} Returns `true` if the entry was removed, else `false`.
//  */
// function listCacheDelete(key) {
//   var data = this.__data__,
//     index = assocIndexOf(data, key);

//   if (index < 0) {
//     return false;
//   }
//   var lastIndex = data.length - 1;
//   if (index == lastIndex) {
//     data.pop();
//   } else {
//     Array.prototype.splice.call(data, index, 1);
//   }
//   --this.size;
//   return true;
// }

// /**
//  * Gets the list cache value for `key`.
//  *
//  * @private
//  * @name get
//  * @memberOf ListCache
//  * @param {string} key The key of the value to get.
//  * @returns {*} Returns the entry value.
//  */
// function listCacheGet(key) {
//   var data = this.__data__,
//     index = assocIndexOf(data, key);

//   return index < 0 ? undefined : data[index][1];
// }

// /**
//  * Checks if a list cache value for `key` exists.
//  *
//  * @private
//  * @name has
//  * @memberOf ListCache
//  * @param {string} key The key of the entry to check.
//  * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
//  */
// function listCacheHas(key) {
//   return assocIndexOf(this.__data__, key) > -1;
// }

// /**
//  * Sets the list cache `key` to `value`.
//  *
//  * @private
//  * @name set
//  * @memberOf ListCache
//  * @param {string} key The key of the value to set.
//  * @param {*} value The value to set.
//  * @returns {Object} Returns the list cache instance.
//  */
// function listCacheSet(key, value) {
//   var data = this.__data__,
//     index = assocIndexOf(data, key);

//   if (index < 0) {
//     ++this.size;
//     data.push([key, value]);
//   } else {
//     data[index][1] = value;
//   }
//   return this;
// }

// // Add methods to `ListCache`.
// ListCache.prototype.clear = listCacheClear;
// ListCache.prototype["delete"] = listCacheDelete;
// ListCache.prototype.get = listCacheGet;
// ListCache.prototype.has = listCacheHas;
// ListCache.prototype.set = listCacheSet;

// /*------------------------------------------------------------------------*/

// /**
//  * Creates a map cache object to store key-value pairs.
//  *
//  * @private
//  * @constructor
//  * @param {Array} [entries] The key-value pairs to cache.
//  */
// function MapCache(entries?) {
//   let index = -1;
//   let length = entries == null ? 0 : entries.length;

//   this.clear();
//   while (++index < length) {
//     var entry = entries[index];
//     this.set(entry[0], entry[1]);
//   }
// }

// /**
//  * Removes all key-value entries from the map.
//  *
//  * @private
//  * @name clear
//  * @memberOf MapCache
//  */
// function mapCacheClear() {
//   this.size = 0;
//   this.__data__ = {
//     hash: new Hash(),
//     map: new (Map || ListCache)(),
//     string: new Hash()
//   };
// }

// /**
//  * Checks if `value` is suitable for use as unique object key.
//  *
//  * @private
//  * @param {*} value The value to check.
//  * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
//  */
// function isKeyable(value) {
//   var type = typeof value;
//   return type == "string" || type == "number" || type == "symbol" || type == "boolean"
//     ? value !== "__proto__"
//     : value === null;
// }

// /**
//  * Gets the data for `map`.
//  *
//  * @private
//  * @param {Object} map The map to query.
//  * @param {string} key The reference key.
//  * @returns {*} Returns the map data.
//  */
// function getMapData(map, key) {
//   var data = map.__data__;
//   return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
// }

// /**
//  * Removes `key` and its value from the map.
//  *
//  * @private
//  * @name delete
//  * @memberOf MapCache
//  * @param {string} key The key of the value to remove.
//  * @returns {boolean} Returns `true` if the entry was removed, else `false`.
//  */
// function mapCacheDelete(key) {
//   var result = getMapData(this, key)["delete"](key);
//   this.size -= result ? 1 : 0;
//   return result;
// }

// /**
//  * Gets the map value for `key`.
//  *
//  * @private
//  * @name get
//  * @memberOf MapCache
//  * @param {string} key The key of the value to get.
//  * @returns {*} Returns the entry value.
//  */
// function mapCacheGet(key) {
//   return getMapData(this, key).get(key);
// }

// /**
//  * Checks if a map value for `key` exists.
//  *
//  * @private
//  * @name has
//  * @memberOf MapCache
//  * @param {string} key The key of the entry to check.
//  * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
//  */
// function mapCacheHas(key) {
//   return getMapData(this, key).has(key);
// }

// /**
//  * Sets the map `key` to `value`.
//  *
//  * @private
//  * @name set
//  * @memberOf MapCache
//  * @param {string} key The key of the value to set.
//  * @param {*} value The value to set.
//  * @returns {Object} Returns the map cache instance.
//  */
// function mapCacheSet(key, value) {
//   var data = getMapData(this, key),
//     size = data.size;

//   data.set(key, value);
//   this.size += data.size == size ? 0 : 1;
//   return this;
// }

// // Add methods to `MapCache`.
// MapCache.prototype.clear = mapCacheClear;
// MapCache.prototype["delete"] = mapCacheDelete;
// MapCache.prototype.get = mapCacheGet;
// MapCache.prototype.has = mapCacheHas;
// MapCache.prototype.set = mapCacheSet;

// /*------------------------------------------------------------------------*/

// /**
//  *
//  * Creates an array cache object to store unique values.
//  *
//  * @private
//  * @constructor
//  * @param {Array} [values] The values to cache.
//  */
// function SetCache(values?) {
//   var index = -1,
//     length = values == null ? 0 : values.length;

//   this.__data__ = new MapCache();
//   while (++index < length) {
//     this.add(values[index]);
//   }
// }

// /**
//  * Adds `value` to the array cache.
//  *
//  * @private
//  * @name add
//  * @memberOf SetCache
//  * @alias push
//  * @param {*} value The value to cache.
//  * @returns {Object} Returns the cache instance.
//  */
// function setCacheAdd(value) {
//   this.__data__.set(value, HASH_UNDEFINED);
//   return this;
// }

// /**
//  * Checks if `value` is in the array cache.
//  *
//  * @private
//  * @name has
//  * @memberOf SetCache
//  * @param {*} value The value to search for.
//  * @returns {number} Returns `true` if `value` is found, else `false`.
//  */
// function setCacheHas(value) {
//   return this.__data__.has(value);
// }

// // Add methods to `SetCache`.
// SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
// SetCache.prototype.has = setCacheHas;

// /**
//  * Creates a stack cache object to store key-value pairs.
//  *
//  * @private
//  * @constructor
//  * @param {Array} [entries] The key-value pairs to cache.
//  */
// function Stack(entries) {
//   var data = (this.__data__ = new ListCache(entries));
//   this.size = data.size;
// }

// /**
//  * Removes all key-value entries from the stack.
//  *
//  * @private
//  * @name clear
//  * @memberOf Stack
//  */
// function stackClear() {
//   this.__data__ = new ListCache();
//   this.size = 0;
// }

// /**
//  * Removes `key` and its value from the stack.
//  *
//  * @private
//  * @name delete
//  * @memberOf Stack
//  * @param {string} key The key of the value to remove.
//  * @returns {boolean} Returns `true` if the entry was removed, else `false`.
//  */
// function stackDelete(key) {
//   var data = this.__data__,
//     result = data["delete"](key);

//   this.size = data.size;
//   return result;
// }

// /**
//  * Gets the stack value for `key`.
//  *
//  * @private
//  * @name get
//  * @memberOf Stack
//  * @param {string} key The key of the value to get.
//  * @returns {*} Returns the entry value.
//  */
// function stackGet(key) {
//   return this.__data__.get(key);
// }

// /**
//  * Checks if a stack value for `key` exists.
//  *
//  * @private
//  * @name has
//  * @memberOf Stack
//  * @param {string} key The key of the entry to check.
//  * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
//  */
// function stackHas(key) {
//   return this.__data__.has(key);
// }

// /**
//  * Sets the stack `key` to `value`.
//  *
//  * @private
//  * @name set
//  * @memberOf Stack
//  * @param {string} key The key of the value to set.
//  * @param {*} value The value to set.
//  * @returns {Object} Returns the stack cache instance.
//  */
// function stackSet(key, value) {
//   var data = this.__data__;
//   if (data instanceof ListCache) {
//     //@ts-ignore
//     var pairs = data.__data__;
//     if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
//       pairs.push([key, value]);
//       //@ts-ignore
//       this.size = ++data.size;
//       return this;
//     }
//     data = this.__data__ = new MapCache(pairs);
//   }
//   data.set(key, value);
//   this.size = data.size;
//   return this;
// }

// // Add methods to `Stack`.
// Stack.prototype.clear = stackClear;
// Stack.prototype["delete"] = stackDelete;
// Stack.prototype.get = stackGet;
// Stack.prototype.has = stackHas;
// Stack.prototype.set = stackSet;

// /**
//  * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
//  * `keysFunc` and `symbolsFunc` to get the enumerable property names and
//  * symbols of `object`.
//  *
//  * @private
//  * @param {Object} object The object to query.
//  * @param {Function} keysFunc The function to get the keys of `object`.
//  * @param {Function} symbolsFunc The function to get the symbols of `object`.
//  * @returns {Array} Returns the array of property names and symbols.
//  */
// function baseGetAllKeys(object, keysFunc, symbolsFunc) {
//   var result = keysFunc(object);
//   return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
// }

// /**
//  * Creates an array of own enumerable property names and symbols of `object`.
//  *
//  * @private
//  * @param {Object} object The object to query.
//  * @returns {Array} Returns the array of property names and symbols.
//  */
// function getAllKeys(object) {
//   return baseGetAllKeys(object, keys, getSymbols);
// }

// /**
//  * A specialized version of `baseIsEqualDeep` for objects with support for
//  * partial deep comparisons.
//  *
//  * @private
//  * @param {Object} object The object to compare.
//  * @param {Object} other The other object to compare.
//  * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
//  * @param {Function} customizer The function to customize comparisons.
//  * @param {Function} equalFunc The function to determine equivalents of values.
//  * @param {Object} stack Tracks traversed `object` and `other` objects.
//  * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
//  */
// function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
//   var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
//     objProps = getAllKeys(object),
//     objLength = objProps.length,
//     othProps = getAllKeys(other),
//     othLength = othProps.length;

//   if (objLength != othLength && !isPartial) {
//     return false;
//   }
//   var index = objLength;
//   while (index--) {
//     var key = objProps[index];
//     if (!(isPartial ? key in other : Object.prototype.hasOwnProperty.call(other, key))) {
//       return false;
//     }
//   }
//   // Assume cyclic values are equal.
//   var stacked = stack.get(object);
//   if (stacked && stack.get(other)) {
//     return stacked == other;
//   }
//   var result = true;
//   stack.set(object, other);
//   stack.set(other, object);

//   var skipCtor = isPartial;
//   while (++index < objLength) {
//     key = objProps[index];
//     var objValue = object[key],
//       othValue = other[key];

//     if (customizer) {
//       var compared = isPartial
//         ? customizer(othValue, objValue, key, other, object, stack)
//         : customizer(objValue, othValue, key, object, other, stack);
//     }
//     // Recursively compare objects (susceptible to call stack limits).
//     if (
//       !(compared === undefined
//         ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack)
//         : compared)
//     ) {
//       result = false;
//       break;
//     }
//     //@ts-ignore
//     skipCtor || (skipCtor = key == "constructor");
//   }
//   if (result && !skipCtor) {
//     var objCtor = object.constructor,
//       othCtor = other.constructor;

//     // Non `Object` object instances with different constructors are not equal.
//     if (
//       objCtor != othCtor &&
//       "constructor" in object &&
//       "constructor" in other &&
//       !(
//         typeof objCtor == "function" &&
//         objCtor instanceof objCtor &&
//         typeof othCtor == "function" &&
//         othCtor instanceof othCtor
//       )
//     ) {
//       result = false;
//     }
//   }
//   stack["delete"](object);
//   stack["delete"](other);
//   return result;
// }

// const symbolValueOf = Symbol.prototype ? Symbol.prototype.valueOf : undefined;

// /**
//  * Converts `map` to its key-value pairs.
//  *
//  * @private
//  * @param {Object} map The map to convert.
//  * @returns {Array} Returns the key-value pairs.
//  */
// function mapToArray(map) {
//   var index = -1,
//     result = Array(map.size);

//   map.forEach(function (value, key) {
//     result[++index] = [key, value];
//   });
//   return result;
// }

// /**
//  * A specialized version of `baseIsEqualDeep` for comparing objects of
//  * the same `toStringTag`.
//  *
//  * **Note:** This function only supports comparing values with tags of
//  * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
//  *
//  * @private
//  * @param {Object} object The object to compare.
//  * @param {Object} other The other object to compare.
//  * @param {string} tag The `toStringTag` of the objects to compare.
//  * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
//  * @param {Function} customizer The function to customize comparisons.
//  * @param {Function} equalFunc The function to determine equivalents of values.
//  * @param {Object} stack Tracks traversed `object` and `other` objects.
//  * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
//  */
// function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
//   switch (tag) {
//     case dataViewTag:
//       if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
//         return false;
//       }
//       object = object.buffer;
//       other = other.buffer;

//     case arrayBufferTag:
//       if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
//         return false;
//       }
//       return true;

//     case boolTag:
//     case dateTag:
//     case numberTag:
//       // Coerce booleans to `1` or `0` and dates to milliseconds.
//       // Invalid dates are coerced to `NaN`.
//       return eq(+object, +other);

//     case errorTag:
//       return object.name == other.name && object.message == other.message;

//     case regexpTag:
//     case stringTag:
//       // Coerce regexes to strings and treat strings, primitives and objects,
//       // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
//       // for more details.
//       return object == other + "";

//     case mapTag:
//       var convert = mapToArray;

//     case setTag:
//       var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
//       //@ts-ignore
//       convert || (convert = setToArray);

//       if (object.size != other.size && !isPartial) {
//         return false;
//       }
//       // Assume cyclic values are equal.
//       var stacked = stack.get(object);
//       if (stacked) {
//         return stacked == other;
//       }
//       bitmask |= COMPARE_UNORDERED_FLAG;

//       // Recursively compare objects (susceptible to call stack limits).
//       stack.set(object, other);
//       var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
//       stack["delete"](object);
//       return result;

//     case symbolTag:
//       if (symbolValueOf) {
//         return symbolValueOf.call(object) == symbolValueOf.call(other);
//       }
//   }
//   return false;
// }

// /**
//  * Checks if a `cache` value for `key` exists.
//  *
//  * @private
//  * @param {Object} cache The cache to query.
//  * @param {string} key The key of the entry to check.
//  * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
//  */
// function cacheHas(cache, key) {
//   return cache.has(key);
// }

// /**
//  * A specialized version of `_.some` for arrays without support for iteratee
//  * shorthands.
//  *
//  * @private
//  * @param {Array} [array] The array to iterate over.
//  * @param {Function} predicate The function invoked per iteration.
//  * @returns {boolean} Returns `true` if any element passes the predicate check,
//  *  else `false`.
//  */
// function arraySome(array, predicate) {
//   var index = -1,
//     length = array == null ? 0 : array.length;

//   while (++index < length) {
//     if (predicate(array[index], index, array)) {
//       return true;
//     }
//   }
//   return false;
// }

// /**
//  * A specialized version of `baseIsEqualDeep` for arrays with support for
//  * partial deep comparisons.
//  *
//  * @private
//  * @param {Array} array The array to compare.
//  * @param {Array} other The other array to compare.
//  * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
//  * @param {Function} customizer The function to customize comparisons.
//  * @param {Function} equalFunc The function to determine equivalents of values.
//  * @param {Object} stack Tracks traversed `array` and `other` objects.
//  * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
//  */
// function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
//   var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
//     arrLength = array.length,
//     othLength = other.length;

//   if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
//     return false;
//   }
//   // Assume cyclic values are equal.
//   var stacked = stack.get(array);
//   if (stacked && stack.get(other)) {
//     return stacked == other;
//   }
//   var index = -1,
//     result = true,
//     seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : undefined;

//   stack.set(array, other);
//   stack.set(other, array);

//   // Ignore non-index properties.
//   while (++index < arrLength) {
//     var arrValue = array[index],
//       othValue = other[index];

//     if (customizer) {
//       var compared = isPartial
//         ? customizer(othValue, arrValue, index, other, array, stack)
//         : customizer(arrValue, othValue, index, array, other, stack);
//     }
//     if (compared !== undefined) {
//       if (compared) {
//         continue;
//       }
//       result = false;
//       break;
//     }
//     // Recursively compare arrays (susceptible to call stack limits).
//     if (seen) {
//       if (
//         !arraySome(other, function (othValue, othIndex) {
//           if (
//             !cacheHas(seen, othIndex) &&
//             (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))
//           ) {
//             return seen.push(othIndex);
//           }
//         })
//       ) {
//         result = false;
//         break;
//       }
//     } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
//       result = false;
//       break;
//     }
//   }
//   stack["delete"](array);
//   stack["delete"](other);
//   return result;
// }
// /**
//  * The base implementation of `_.isTypedArray` without Node.js optimizations.
//  *
//  * @private
//  * @param {*} value The value to check.
//  * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
//  */
// function baseIsTypedArray(value) {
//   return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
// }

// function baseUnary(func) {
//   return function (value) {
//     return func(value);
//   };
// }

// var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
// var moduleExports = freeModule && freeModule.exports === freeExports;
// //@ts-ignore
// var freeProcess = moduleExports && freeGlobal.process;
// var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
// //@ts-ignore
// var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
// /** Used to access faster Node.js helpers. */
// var nodeUtil = (function () {
//   try {
//     // Use `util.types` for Node.js 10+.
//     var types = freeModule && freeModule.require && freeModule.require("util").types;

//     if (types) {
//       return types;
//     }

//     // Legacy `process.binding('util')` for Node.js < 10.
//     return freeProcess && freeProcess.binding && freeProcess.binding("util");
//   } catch (e) {}
// })();

// /**
//  * The base implementation of `_.isArrayBuffer` without Node.js optimizations.
//  *
//  * @private
//  * @param {*} value The value to check.
//  * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
//  */
// function baseIsArrayBuffer(value) {
//   return isObjectLike(value) && baseGetTag(value) == arrayBufferTag;
// }
// const nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

// /**
//  * The base implementation of `_.isArguments`.
//  *
//  * @private
//  * @param {*} value The value to check.
//  * @returns {boolean} Returns `true` if `value` is an `arguments` object,
//  */
// function baseIsArguments(value) {
//   return isObjectLike(value) && baseGetTag(value) == argsTag;
// }

// const nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
// var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
// function stubFalse() {
//   return false;
// }
// var isArguments = baseIsArguments(
//   (function () {
//     return arguments;
//   })()
// )
//   ? baseIsArguments
//   : function (value) {
//       return (
//         isObjectLike(value) &&
//         Object.hasOwnProperty.call(value, "callee") &&
//         !Object.propertyIsEnumerable.call(value, "callee")
//       );
//     };
// /**
//  * The base implementation of `_.times` without support for iteratee shorthands
//  * or max array length checks.
//  *
//  * @private
//  * @param {number} n The number of times to invoke `iteratee`.
//  * @param {Function} iteratee The function invoked per iteration.
//  * @returns {Array} Returns the array of results.
//  */
// function baseTimes(n, iteratee) {
//   var index = -1,
//     result = Array(n);

//   while (++index < n) {
//     result[index] = iteratee(index);
//   }
//   return result;
// }

// var reIsUint = /^(?:0|[1-9]\d*)$/;

// /**
//  * Checks if `value` is a valid array-like index.
//  *
//  * @private
//  * @param {*} value The value to check.
//  * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
//  * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
//  */
// function isIndex(value, length) {
//   var type = typeof value;
//   length = length == null ? MAX_SAFE_INTEGER : length;

//   return (
//     !!length &&
//     (type == "number" || (type != "symbol" && reIsUint.test(value))) &&
//     value > -1 &&
//     value % 1 == 0 &&
//     value < length
//   );
// }

// /**
//  * Creates an array of the enumerable property names of the array-like `value`.
//  *
//  * @private
//  * @param {*} value The value to query.
//  * @param {boolean} inherited Specify returning inherited property names.
//  * @returns {Array} Returns the array of property names.
//  */
// function arrayLikeKeys(value, inherited) {
//   var isArr = isArray(value),
//     isArg = !isArr && isArguments(value),
//     isBuff = !isArr && !isArg && isBuffer(value),
//     isType = !isArr && !isArg && !isBuff && isTypedArray(value),
//     skipIndexes = isArr || isArg || isBuff || isType,
//     result = skipIndexes ? baseTimes(value.length, String) : [],
//     length = result.length;

//   for (var key in value) {
//     if (
//       (inherited || Object.hasOwnProperty.call(value, key)) &&
//       !(
//         skipIndexes &&
//         // Safari 9 has enumerable `arguments.length` in strict mode.
//         (key == "length" ||
//           // Node.js 0.10 has enumerable non-index properties on buffers.
//           (isBuff && (key == "offset" || key == "parent")) ||
//           // PhantomJS 2 has enumerable non-index properties on typed arrays.
//           (isType && (key == "buffer" || key == "byteLength" || key == "byteOffset")) ||
//           // Skip index properties.
//           isIndex(key, length))
//       )
//     ) {
//       result.push(key);
//     }
//   }
//   return result;
// }

// const isBuffer = nativeIsBuffer || stubFalse;
// const nativeObjectToString = Object.prototype.toString;
// /**
//  * Converts `value` to a string using `Object.prototype.toString`.
//  *
//  * @private
//  * @param {*} value The value to convert.
//  * @returns {string} Returns the converted string.
//  */
// function objectToString(value) {
//   return nativeObjectToString.call(value);
// }
// function isLength(value) {
//   return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
// }
// function isArrayLike(value) {
//   return value != null && isLength(value.length) && !isFunction(value);
// }

// function keys(object) {
//   return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
// }
// /**
//  * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
//  *
//  * @private
//  * @param {*} value The value to query.
//  * @returns {string} Returns the raw `toStringTag`.
//  */
// function getRawTag(value) {
//   var isOwn = hasOwnProperty.call(value, symToStringTag),
//     tag = value[symToStringTag];

//   try {
//     value[symToStringTag] = undefined;
//     var unmasked = true;
//   } catch (e) {}

//   var result = nativeObjectToString.call(value);
//   if (unmasked) {
//     if (isOwn) {
//       value[symToStringTag] = tag;
//     } else {
//       delete value[symToStringTag];
//     }
//   }
//   return result;
// }

// /**
//  * The base implementation of `getTag` without fallbacks for buggy environments.
//  *
//  * @private
//  * @param {*} value The value to query.
//  * @returns {string} Returns the `toStringTag`.
//  */
// function baseGetTag(value) {
//   if (value == null) {
//     return value === undefined ? undefinedTag : nullTag;
//   }
//   return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
// }

// const getTag = baseGetTag;

// const isArray = Array.isArray;

// /**
//  * A specialized version of `baseIsEqual` for arrays and objects which performs
//  * deep comparisons and tracks traversed objects enabling objects with circular
//  * references to be compared.
//  *
//  * @private
//  * @param {Object} object The object to compare.
//  * @param {Object} other The other object to compare.
//  * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
//  * @param {Function} customizer The function to customize comparisons.
//  * @param {Function} equalFunc The function to determine equivalents of values.
//  * @param {Object} [stack] Tracks traversed `object` and `other` objects.
//  * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
//  */
// function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
//   var objIsArr = isArray(object),
//     othIsArr = isArray(other),
//     objTag = objIsArr ? arrayTag : getTag(object),
//     othTag = othIsArr ? arrayTag : getTag(other);

//   objTag = objTag == argsTag ? objectTag : objTag;
//   othTag = othTag == argsTag ? objectTag : othTag;

//   var objIsObj = objTag == objectTag,
//     othIsObj = othTag == objectTag,
//     isSameTag = objTag == othTag;

//   if (isSameTag && isBuffer(object)) {
//     if (!isBuffer(other)) {
//       return false;
//     }
//     objIsArr = true;
//     objIsObj = false;
//   }
//   if (isSameTag && !objIsObj) {
//     stack || (stack = new Stack());
//     return objIsArr || isTypedArray(object)
//       ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
//       : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
//   }
//   if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
//     var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"),
//       othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");

//     if (objIsWrapped || othIsWrapped) {
//       var objUnwrapped = objIsWrapped ? object.value() : object,
//         othUnwrapped = othIsWrapped ? other.value() : other;

//       stack || (stack = new Stack());
//       return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
//     }
//   }
//   if (!isSameTag) {
//     return false;
//   }
//   stack || (stack = new Stack());
//   return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
// }

// /**
//  * The base implementation of `_.isEqual` which supports partial comparisons
//  * and tracks traversed objects.
//  *
//  * @private
//  * @param {*} value The value to compare.
//  * @param {*} other The other value to compare.
//  * @param {boolean} bitmask The bitmask flags.
//  *  1 - Unordered comparison
//  *  2 - Partial comparison
//  * @param {Function} [customizer] The function to customize comparisons.
//  * @param {Object} [stack] Tracks traversed `value` and `other` objects.
//  * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
//  */
// function baseIsEqual(value, other, bitmask, customizer, stack) {
//   if (value === other) {
//     return true;
//   }
//   if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
//     return value !== value && other !== other;
//   }
//   return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
// }
