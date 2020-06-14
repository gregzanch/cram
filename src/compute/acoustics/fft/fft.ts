import { Complex } from '../complex';

export type ArrayOfValues =
  | Complex[]
  | Float32Array
  | Float64Array
  | Uint16Array
  | Uint32Array
  | Uint8Array
  | number[];

export class FFT {
  // W factors
  private w: Complex[] = [];

  // Bit reversal table
  private bitReversalTable: number[] = [];

  // Previous array size
  private previousArraySize: number = 0;

  /**
   * Operates a 2D Cooley-Tukey FFT.
   * @param data
   * @param width
   * @param height
   */
  public fft2d(data: Complex[][], width: number, height: number): Complex[][] {
    const [W, H] = [width, height];

    let spectrum: Complex[][] = new Array(H);

    // Apply a 1D FFT to each row
    spectrum = data.map(row => this.fft1d(row, W));
    spectrum = this.transpose(spectrum, W, H);

    // Apply a 1D FFT to each column
    spectrum = spectrum.map(row => this.fft1d(row, H));
    spectrum = this.transpose(spectrum, H, W);

    return spectrum;
  }

  /**
   * Operates a 2D Cooley-Tukey IFFT.
   * @param spectrum
   * @param width
   * @param height
   */
  public ifft2d(
    spectrum: Complex[][],
    width: number,
    height: number
  ): Complex[][] {
    const [W, H] = [width, height];

    let data: Complex[][] = new Array(H);

    // Apply a 1D IFFT to each column
    data = this.transpose(spectrum, W, H);
    data = data.map(row => this.ifft1d(row, H));

    // Apply a 1D IFFT to each row
    data = this.transpose(data, H, W);
    data = data.map(row => this.ifft1d(row, W));

    return data;
  }

  /**
   * Operates a 1D Cooley-Tukey FFT.
   * @param data
   * @param size
   */
  public fft1d(data: Complex[], size: number): Complex[] {
    const N = size;

    this.calcFactors(N);
    this.createBitReversalTable(N);
    this.updateArraySize(N);

    let spectrum = this.sortData(data, N);

    for (let a = 1, b = N / 2; a < N; a *= 2, b /= 2) {
      for (let k = 0; k < a; k++) {
        for (let n = k; n < N; n += 2 * a) {
          let tmp = spectrum[n + a].multiply(this.w[b * k]);
          spectrum[n + a] = spectrum[n].subtract(tmp);
          spectrum[n] = spectrum[n].add(tmp);
        }
      }
    }

    return spectrum;
  }

  /**
   * Operates a 1D Cooley-Tukey IFFT.
   * @param data
   * @param size
   */
  public ifft1d(spectrum: Complex[], size: number): Complex[] {
    const N = size;

    let data: Complex[] = spectrum.map(c => c.swap());
    data = this.fft1d(data, N);
    data = data.map(c => c.swap().divide(new Complex({ real: N, imag: 0 })));

    return data;
  }

  /**
   * Calculates the power spectrum of the given 2D spectrum and finds the max value.
   * @param spectrum
   * @param width
   * @param height
   */
  public power2d(
    spectrum: Complex[][],
    width: number,
    height: number
  ): [number[][], number] {
    let powerSpectrum: number[][] = new Array(height);
    let max: number = 0;

    powerSpectrum = spectrum.map(row => {
      let [rowSpectrum, rowMax] = this.power1d(row, width);
      max = Math.max(max, rowMax);
      return rowSpectrum;
    });

    return [powerSpectrum, max];
  }

  /**
   * Calculates the power spectrum of the given 1D spectrum and finds the max value.
   * @param spectrum
   * @param size
   */
  public power1d(spectrum: Complex[], size: number): [number[], number] {
    let powerSpectrum = new Array(size);
    let max = 0;

    for (let x = 0; x < size; x++) {
      powerSpectrum[x] = spectrum[x].absolute() ** 2;
      max = Math.max(max, powerSpectrum[x]);
    }

    return [powerSpectrum, max];
  }

  /**
   * Sorts the given data array depending on the bit reversal table.
   * @param data Data array
   * @param size Array size
   */
  private sortData(data: Complex[], size: number): Complex[] {
    const N = size;
    let sortedData: Complex[] = new Array(N);

    for (let k = 0; k < N; k++) {
      let l = this.bitReversalTable[k];
      sortedData[k] = data[l].copy();
    }

    return sortedData;
  }

  /**
   * Calculates W factors.
   * @param size Array size (1D)
   */
  private calcFactors(size: number) {
    const N = size;
    if (size != this.previousArraySize) {
      this.w = new Array(N);
      for (let k = 0; k < N / 2; k++) {
        let c = this.exponential((-2 * Math.PI * k) / N);
        this.w[k] = c;
      }
    }
  }

  /**
   * Creates a bit reversal table of the given array size `size`.
   * @param size Array size
   */
  private createBitReversalTable(size: number) {
    if (size != this.previousArraySize) {
      const N = size;
      const power = this.getExponent2(size);
      this.bitReversalTable = new Array(N);
      for (let n = 0; n < N; n++) {
        this.bitReversalTable[n] = this.reverseBits(n, power);
      }
    }
  }

  /**
   * Operates bit reversal to a given number.
   * @param n Number to operate bit reversal
   * @param power Number of bits
   */
  private reverseBits(n: number, power: number): number {
    const N = Math.ceil(power / 2);
    const bits = n.toString(2).padStart(power, '0');
    let reversedBits: string[] = new Array(power);

    for (let k = 0; k < N; k++) {
      reversedBits[k] = bits[power - k];
      reversedBits[power - k] = bits[k];
    }

    const binaryRepresentation: string = reversedBits.join('');
    return parseInt(binaryRepresentation, 2);
  }

  /**
   * Operates log2(n) to the given number `n`.
   * @param n number
   */
  private getExponent2(n: number): number {
    let p = Math.log2(n);
    if (Number.isInteger(p) == false) {
      throw Error();
    }
    return p;
  }

  /**
   * Initializes a 2D array with the given size.
   * @param width Number of columns
   * @param height Number of rows
   */
  private init2DArray(width: number, height: number): any[][] {
    let array = new Array(height).fill(null).map(() => new Array(width));
    return array;
  }

  /**
   * Exponential function.
   * @param arg Argument of e
   */
  private exponential(arg: number): Complex {
    return new Complex({ radius: 1, arg: arg });
  }

  /**
   * Updates previous array size.
   * @param size New array size
   */
  private updateArraySize(size: number) {
    if (size != this.previousArraySize) {
      this.previousArraySize = size;
    }
  }

  /**
   * Transposes the given 2D data array.
   * @param data
   * @param width
   * @param height
   */
  private transpose(
    data: Complex[][],
    width: number,
    height: number
  ): Complex[][] {
    const [W, H] = [width, height];
    let transposedData: Complex[][] = this.init2DArray(W, H);

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        transposedData[y][x] = data[x][y].copy();
      }
    }

    return transposedData;
  }

  /**
   * Shifts coordinates.
   * @param x
   * @param y
   * @param width
   * @param height
   */
  public shift(data: Complex[][], width: number, height: number): Complex[][] {
    const [W, H] = [width, height];
    const centerX = W / 2;
    const centerY = H / 2;

    let shiftedData: Complex[][] = this.init2DArray(W, H);

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let u = (x + centerX) % W;
        let v = (y + centerY) % H;
        shiftedData[v][u] = data[y][x].copy();
      }
    }

    return shiftedData;
  }
}
