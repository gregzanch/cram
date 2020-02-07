export class Complex {
  // Real part
  public real: number;

  // Imaginary part
  public imag: number;

  constructor(params: any) {
    let real = 0;
    let imag = 0;

    // Euclidean
    if ('real' in params && 'imag' in params) {
      real = params.real;
      imag = params.imag;
    }

    // Polar
    else if ('radius' in params && 'arg' in params) {
      real = params.radius * Math.cos(params.arg);
      imag = params.radius * Math.sin(params.arg);
    }

    // Error
    else {
      throw Error();
    }

    this.real = real;
    this.imag = imag;
  }

  /**
   * Conjugates the complex number.
   */
  public conjugate(): Complex {
    return new Complex({ real: this.real, imag: -this.imag });
  }

  /**
   * Calculates the absolute value of the complex number;
   */
  public absolute(): number {
    const abs = this.real ** 2 + this.imag ** 2;
    return Math.sqrt(abs);
  }

  /**
   * Swaps the real part and the imaginary part.
   */
  public swap(): Complex {
    return new Complex({ real: this.imag, imag: this.real });
  }

  /**
   * Adds a complex number.
   * @param c Complex number to add
   */
  public add(c: Complex): Complex {
    const real = this.real + c.real;
    const imag = this.imag + c.imag;
    return new Complex({ real: real, imag: imag });
  }

  /**
   * Subtracts a complex number.
   * @param c Complex number to subtract
   */
  public subtract(c: Complex): Complex {
    const real = this.real - c.real;
    const imag = this.imag - c.imag;
    return new Complex({ real: real, imag: imag });
  }

  /**
   * Multiplies a complex number.
   * @param c Complex number to multiply
   */
  public multiply(c: Complex): Complex {
    const real = this.real * c.real - this.imag * c.imag;
    const imag = this.real * c.imag + this.imag * c.real;
    return new Complex({ real: real, imag: imag });
  }

  /**
   * Divides a complex number.
   * @param c Complex number to devide by.
   */
  public divide(c: Complex): Complex {
    const cc = c.real ** 2;
    const dd = c.imag ** 2;
    const product = this.multiply(c.conjugate());
    const real = product.real / (cc + dd);
    const imag = product.imag / (cc + dd);
    return new Complex({ real: real, imag: imag });
  }

  /**
   * Converts the complex number to a string.
   * @param unit Imaginary unit ('i' or 'j').
   */
  public toString(unit: string = 'i'): string {
    if (this.imag >= 0) {
      return `${this.real} + ${unit}${this.imag}`;
    } else {
      return `${this.real} + ${unit}${-this.imag}`;
    }
  }

  /**
   * Converts the complex number to an array ([real, imag] format).
   */
  public toArray(): [number, number] {
    return [this.real, this.imag];
  }

  /**
   * Copies the complex number object.
   */
  public copy(): Complex {
    return new Complex({ real: this.real, imag: this.imag });
  }
}

export function makeComplexArray(arr: number[]): Complex[] {
  return arr.map(
    (x: number) =>
      new Complex({
        real: x,
        imag: 0,
      })
  );
}
