import { Hann } from './functions/hann';

export interface WindowFunctionDictionary {
  [index: string]: (N: number) => number[];
}

export const WindowFunctions = {
  Hann,
} as WindowFunctionDictionary;

export { Hann };
