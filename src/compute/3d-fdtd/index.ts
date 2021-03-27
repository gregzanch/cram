//@ts-nocheck
import { GPU, IGPUKernelSettings, IKernelFunctionThis } from "gpu.js";
const { sin, cos, PI: pi } = Math;
/**
 * 
 * Wave number is the magnitude of the wave vector
 *    k = ω/c
 * 
 * Magnitude of the ratio between pressure and velocity
 *    |P/v| = ρc
 * 
 * Characteristic impedance
 *    Z = ρc
 * 
 * the pressure nodes are offset a half time-step
 * 
 */

export class FDTD_3D {
  gpu: any;
  nx: number;
  ny: number;
  nz: number;
  n: number;
  Po: Float32Array;
  Vx: Float32Array;
  Vy: Float32Array;
  Vz: Float32Array;
  rho: Float32Array;
  cr: Float32Array;
  c0: number;
  dt: number;
  dx: number;
  Sc: number;
  megaKernel: any;

  constructor() {
    this.gpu = new GPU();

    this.nx = 128;
    this.ny = 128;
    this.nz = 128;
    this.n = this.nx * this.ny * this.nz;
    this.Po = new Float32Array(this.n);
    this.Vx = new Float32Array(this.n);
    this.Vy = new Float32Array(this.n);
    this.Vz = new Float32Array(this.n);
    this.rho = new Float32Array(this.n);
    this.cr = new Float32Array(this.n);
    this.c0 = 343;
    this.dt = 1e-4;
    this.dx = 0.05;
    this.Sc = this.c0 * this.dt * this.dx;

    for (let k = 0; k < this.nz; k++) {
      for (let j = 0; j < this.ny; j++) {
        for (let i = 0; i < this.nx; i++) {
          const index = k * (this.nx * this.ny) + j * this.nx + i;
          this.Po[index] = 0;
          this.Vx[index] = 0;
          this.Vy[index] = 0;
          this.Vz[index] = 0;
          this.rho[index] = 1.225; // kg / m^3
          this.cr[index] = 1;
          if (k == this.nz / 2 && j == this.ny / 2 && i == this.nx / 2) {
            this.Po[index] = 1;
          }
        }
      }
    }

    this.megaKernel = this.gpu.createKernelMap(
      {
        Vx: function update_Vx(
          p: number,
          p_xstep: number,
          vx: number,
          rho: number,
          rho_xstep: number,
          c0: number,
          Sc: number
        ) {
          return vx - ((2 * Sc) / (c0 * (rho + rho_xstep))) * (p_xstep - p);
        },
        Vy: function update_Vy(
          p: number,
          p_ystep: number,
          vy: number,
          rho: number,
          rho_ystep: number,
          c0: number,
          Sc: number
        ) {
          return vy - ((2 * Sc) / (c0 * (rho + rho_ystep))) * (p_ystep - p);
        },
        Vz: function update_Vz(
          p: number,
          p_zstep: number,
          vz: number,
          rho: number,
          rho_zstep: number,
          c0: number,
          Sc: number
        ) {
          return vz - ((2 * Sc) / (c0 * (rho + rho_zstep))) * (p_zstep - p);
        }
      },
      function (Po, Vx, Vy, Vz, rho, cr, c0: number, Sc: number, nx: number, ny: number, nz: number) {
        const index = this.thread.x;
        const z = Math.trunc(index / (nx * ny));
        const y = Math.trunc((index - z * nx * ny) / nx);
        const x = Math.trunc((index - z * nx * ny) % nx);

        const x_prev = (z - 0) * nx * ny + (y - 0) * nx + (x - 1);
        const x_next = (z + 0) * nx * ny + (y + 0) * nx + (x + 1);

        const y_prev = (z - 0) * nx * ny + (y - 1) * nx + (x - 0);
        const y_next = (z + 0) * nx * ny + (y + 1) * nx + (x + 0);

        const z_prev = (z - 1) * nx * ny + (y - 0) * nx + (x - 0);
        const z_next = (z + 1) * nx * ny + (y + 0) * nx + (x + 0);

        const p = Po[index];

        const p_xstep = x == nx - 1 ? Po[x_prev] : Po[x_next];
        const rho_xstep = x == nx - 1 ? rho[x_prev] : rho[x_next];

        const p_ystep = y == ny - 1 ? Po[y_prev] : Po[y_next];
        const rho_ystep = y == ny - 1 ? rho[y_prev] : rho[y_next];

        const p_zstep = z == nz - 1 ? Po[z_prev] : Po[z_next];
        const rho_zstep = z == nz - 1 ? rho[z_prev] : rho[z_next];

        const coef = rho[index] * Math.pow(cr[index], 2) * c0 * Sc;

        const vx_prev = x == 0 ? 0 : Vx[x_prev];
        const vy_prev = y == 0 ? 0 : Vy[y_prev];
        const vz_prev = z == 0 ? 0 : Vz[z_prev];

        return (
          p -
          coef *
            //@ts-ignore
            (update_Vx(p, p_xstep, Vx[index], rho[index], rho_xstep, c0, Sc) -
              vx_prev +
              //@ts-ignore
              update_Vy(p, p_ystep, Vy[index], rho[index], rho_ystep, c0, Sc) -
              vy_prev +
              //@ts-ignore
              update_Vz(p, p_zstep, Vz[index], rho[index], rho_zstep, c0, Sc) -
              vz_prev)
        );
      },
      { output: [this.n] }
    );
  }
  
  step() {
    const { Vx, Vy, Vz, result: Po } = this.megaKernel(this.Po, this.Vx, this.Vy, this.Vz, this.rho, this.cr, this.c0, this.Sc, this.nx, this.ny, this.nz);
    this.Vx = Vx;
    this.Vy = Vy;
    this.Vz = Vz;
    this.Po = Po;
  }

}

export default FDTD_3D;