import { FFT } from "./fft";
import { Complex, makeComplexArray } from "../complex";
import { Float32Array_to_ComplexArray } from "../util/complex-array";
import { chunk } from "../util/chunk";
import * as win from "../window/applyWindow";
import WindowFunctions, { WindowFunction } from "../window/window-functions";

export interface fftoptions {
  buffersize?: number;
  dim?: number;
  absolute?: boolean;
  window?: WindowFunction;
}

const default_fftoptions: fftoptions = {
  buffersize: 0,
  dim: 1,
  absolute: false,
  window: "Hann"
};

export function fft(values: number[] | Complex[] | Float32Array, opts: fftoptions = default_fftoptions) {
  opts = Object.assign(default_fftoptions, opts || default_fftoptions);
  // console.log(opts);

  if (!(values instanceof Array || values instanceof Float32Array)) throw new Error("need to pass in an array");

  // let n = Math.pow(2, Math.floor(Math.log(values.length) / Math.LN2));
  const makebuffer = chunk(opts.buffersize || 1024);
  let arr: Complex[][] = [[]];

  if (values[0] instanceof Complex) {
    arr = makebuffer(values as Complex[]).map((x: Complex[]) => {
      return win.applyWindowComplex(opts.window || "Hann")(x);
    });
  }

  if (values instanceof Float32Array) {
    arr = makebuffer(Float32Array_to_ComplexArray(values)).map((x: Complex[]) => {
      return win.applyWindowComplex(opts.window || "Hann")(x);
    });
  }

  if (values[0] instanceof Number) {
    arr = makebuffer(makeComplexArray(values as number[])).map((x: Complex[]) => {
      return win.applyWindowComplex(opts.window || "Hann")(x);
    });
  }

  return (arr as Complex[][]).map((x) => {
    if (x.length == opts.buffersize) {
      return new FFT().fft1d(x, opts.buffersize || 1024);
    } else {
      return new FFT().fft1d(
        x.concat(
          Array((opts.buffersize || 1024) - x.length).fill(
            new Complex({
              real: 0,
              imag: 0
            })
          )
        ),
        opts.buffersize || 1024
      );
    }
  });
}
