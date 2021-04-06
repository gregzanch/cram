import { interpolate } from "chroma-js";
import interpolateAlpha from "./interpolate-alpha";
import { between } from "../../common/helpers";

export function interpolateLog(x1, y1, x2, y2, xi) {
  return y1 + (Math.log10(xi) - Math.log10(x1)) / (Math.log10(x2) - Math.log10(x1)) * (y2 - y1);
}
export function interpolateLinear(x1, y1, x2, y2, xi) {
  return y1 + (xi - x1) / (x2 - x1) * (y2 - y1);
}



export type InterpolationTableOptions = {
  xScale?: 'linear' | 'log',
  yScale?: 'linear' | 'log'
}

const defaultOptions: InterpolationTableOptions = {
  xScale: 'linear',
  yScale: 'linear',
}


const betweenLimits = (arr: number[], value: number): [number, number] => {
  if(value <= arr[0]){
    return [arr[0], arr[1]] as [number, number];
  }
  else if(value >= arr[arr.length-1]){
    return [arr[arr.length-2], arr[arr.length-1]] as [number, number];
  }
  else {
    for(let i = 1; i<arr.length; i++){
      if(between(value, arr[i-1], arr[i])){
        return [arr[i-1], arr[i]] as [number, number];
      }
    }
    throw new Error("value could not be found within input array");
  }
}

const data = [
  [0.003, 0.003, 0.003, 0.003, 0.017, 0.034, 0.043, 0.046],
  [0.009, 0.007, 0.022, 0.023, 0.08, 0.207, 0.25, 0.302],
  [0.014, 0.011, 0.04, 0.152, 0.33, 0.448, 0.497, 0.529],
  [0.017, 0.034, 0.115, 0.443, 0.664, 0.77, 0.83, 0.851],
  [0.02, 0.072, 0.256, 0.724, 0.882, 0.902, 0.922, 0.934],
  [0.049, 0.175, 0.698, 0.874, 0.94, 0.957, 0.977, 0.989]
]
const freqs = [63, 125, 250, 500, 1000, 2000, 4000, 8000];

const scatteringCoefficients = [0.01,0.05,0.25,0.55,0.8,0.9];

export function scatteringFunction(coef: number) {
  const [x1, x2] = betweenLimits(scatteringCoefficients, coef) //?
  const f1 = data[scatteringCoefficients.indexOf(x1)]; //?
  const f2 = data[scatteringCoefficients.indexOf(x2)]; //?
  const newF = f1.map((x,i)=>interpolateLinear(x1,f1[i], x2,f2[i], coef)); //?
  return interpolateAlpha(newF, freqs);
}

export default scatteringFunction;



// scatteringFunction(0.35)(63) //?
