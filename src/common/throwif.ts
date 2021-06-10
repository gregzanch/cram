
/**
 * utility function for more consise error handling
 * @param condition condition to test
 * @param message message to throw if failed
 */
 export function throwif(condition: boolean, message: string) {
  if(!condition) throw Error(message);
}
