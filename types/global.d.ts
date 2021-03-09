import { Cram, State } from "../src";

declare global {
  const cram: Cram;
  declare type vec3 = [number, number, number];
  declare type vec4 = [number, number, number, number];
  declare type mat4 = [
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number]
  ];
  interface Window {
    vars: any;
    cram: Cram;
  }

}
export {};


