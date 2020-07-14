export function makeVariableName(str: string) {
  const seperatorCharacters = /[\s\.\,\:\&]+/i;
  const nonWordCharacters = /[^\w]+/i;
  return str
    .toLowerCase() 
    .split(seperatorCharacters) 
    .map(x => x.replace(nonWordCharacters, '')) 
    .join("_");
}

export function makeUniqueVariableName(str: string, existingVariableNames: string[]) {
  const varname = makeVariableName(str);
  if (!existingVariableNames.includes(varname)) {
    return varname;
  }
  let i = 1;
  while (existingVariableNames.includes(`${varname}_${i}`)) {
    i++;
  }
  return `${varname}_${i}`;
}

