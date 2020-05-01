// Declared `importObject` function
declare function consoleLog(arg0: f32): void;

export function testFunction(value: f32): f32 {
  const doublevalue: f32 = value * 2;
  consoleLog(doublevalue);
  return doublevalue;
}

export namespace foo {
  export class Bar {
    a: i32 = 1;
    getA(): i32 {
      return this.a;
    }
  }
}