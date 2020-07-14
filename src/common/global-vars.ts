
import { makeUniqueVariableName } from './make-variable-name';


export function addToGlobalVars(object: any, name: string) {
  const varname = makeUniqueVariableName(name, Object.keys(window.vars));
  window.vars[varname] = object;
  console.group(varname);
  console.log(
    `%cYou can access this via vars.${varname}`,
    'font-style: oblique; color: rgba(127,127,127,1); font-family: Consolas, Menlo, monospace;'
  );
  console.log(object);
  console.groupEnd();
}

