/** splitTabular
 * Splits a string of delimeted data
 * (like a .csv or .tsv) into a 2d array of strings
 *
 * use case: parse a .csv or tsv file by reading
 *           the file into memory as a string,
 *           then passing that string into this function
 * @function splitTabular
 *
 * @example
 * let str = `1,2\n3,4`;
 * let table = splitTabular(str, {line: ',', cell: '\n'});
 * console.log(table); //[[1,2], [3,4]]
 */
export function splitTabular(
  str: string,
  {
    line = '\n',
    cell = '\t',
  }: {
    line?: string | RegExp;
    cell?: string | RegExp;
  } = {}
): string[][] {
  return str.split(line).map(x => x.split(cell));
}
