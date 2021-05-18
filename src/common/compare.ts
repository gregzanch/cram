
/**
 * checks for equality between two arrays of depth 1
 * @param first target array
 * @param second array to check for equality
 * @param compare optional comparison function
 */
export function compareArrays<T>(first: T[], second: T[], compare = (a: T, b: T) => a === b) {
  if (!first && !second) return true;
  if(!first || !second || first.length !== second.length) return false;
  return first.every((item, index) => compare(item, second[index]));
}
