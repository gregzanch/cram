import { Cram, State } from "../src";

declare global {
  const cram: Cram;

  interface Window {
    vars: any;
    cram: Cram;
  }
}
export {};
