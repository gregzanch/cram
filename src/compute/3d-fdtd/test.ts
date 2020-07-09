const outputShape = [3, 6, 2];

const [nx, ny, nz] = outputShape;
const n = nx * ny * nz;
const Po = new Float32Array(n);
const t = [] as number[][][];
const answers = [] as [number, number, number][];
for (let i = 0; i < nx; i++) {
  t.push([] as number[][]);
  for (let j = 0; j < ny; j++) {
    t[i].push([] as number[]);
    for (let k = 0; k < nz; k++) {
      const index = k * (nx * ny) + j * nx + i;
      Po[index] = index;
      t[i][j].push(index);
      answers[index]=[i, j, k];
    }
  }
}


Po; //?


const getIndex = (nx: number, ny: number) => (x: number, y: number, z: number) => z * (nx * ny) + y * nx + x;

const getXYZ = (nx: number, ny: number, nz: number) => (index: number) => [(index % nx) % ny, index % nx];


const to1d =  (nx: number, ny: number) => (x,y,z) => (z * nx * ny) + (y * nx) + x;

const to3d =  (nx: number, ny: number) => (index: number) => {
  const z = (index % nx) % ny;
  index = index - (z * nx * ny);
  const y = Math.trunc(index / nx);
  const x = Math.trunc(index % nx);
  return [x, y, z];
}
const isSame = (nx: number, ny: number) => (index: number) => {
  const mod = (index % nx) % ny;
  const tr = Math.trunc(index / (nx * ny));
  return mod === tr;
};
answers[3] //?
getXYZ(nx, ny, nz)(3); //?
to3d(nx, ny)(3); //?
isSame(nx, ny)(3); //?


t;//?