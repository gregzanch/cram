//@ts-nocheck
import { GPU } from 'gpu.js';

let dt = 0.1;
let t = 0;
let c = .343;
let dx = 0.1;
let dy = 0.1;
let Cx = (c * dt) / dx;
let Cy = (c * dt) / dy;

export default function test() {
  const gpu = new GPU();
  const multiplyMatrix = gpu
    .createKernel(function (a: number[][], b: number[][], Cx, Cy) {
      let sum = 0;
      let left = this.thread.x == 0 ? 0 : a[this.thread.x - 1][this.thread.y];
      let right = this.thread.x == 15 ? 0 : a[this.thread.x + 1][this.thread.y];
      let bottom = this.thread.y == 0 ? 0 : a[this.thread.x][this.thread.y - 1];
      let top = this.thread.y == 15 ? 0 : a[this.thread.x][this.thread.y + 1];
      let i = this.thread.x;
      let j = this.thread.y;
      if (i == 0 || i == 15 || j == 0 || j== 15){ return 0 }
      else {
        return (-1 * a[i][j] + 2 * b[i][j] +
						Cx * Cx *
							(+1 * b[i + 1][j] -
								2 * b[i + 0][j] +
								1 * b[i - 1][j]) +
						Cy * Cy *
							(+1 * b[i][j + 1] -
								2 * b[i][j + 0] +
            1 * b[i][j - 1])
        );
      }
    })
    .setOutput([16, 16]);

  
  const a = [] as number[][];
  const b = [] as number[][];

  for (let i = 0; i < 16; i++) {
    const aa = [] as number[];
    const bb = [] as number[];
    for (let j = 0; j < 16; j++) {
      aa.push(0);
      bb.push(0);
    }
    a.push(aa);
    b.push(bb);
  }
  b[8][8] = .1;
  const res = multiplyMatrix(a, b, Cx, Cy) as number[][];
  return multiplyMatrix(b, res, Cx, Cy);
  
}
