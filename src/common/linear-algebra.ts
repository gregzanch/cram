export const transform = {
  /**
   * transforms a 3 component vector by a 4x4 transformation matrix
   * @param vector 3 component vector
   * @param matrix 4x4 matrix
   */
  v3m4: (vector: vec3, matrix: mat4) => {
    const [x, y, z] = vector;
    const w = 1 / (matrix[0][3] * x + matrix[1][3] * y + matrix[2][3] * z + matrix[3][3]);
    return [
      (matrix[0][0] * x + matrix[1][0] * y + matrix[2][0] * z + matrix[3][0]) * w,
      (matrix[0][1] * x + matrix[1][1] * y + matrix[2][1] * z + matrix[3][1]) * w,
      (matrix[0][2] * x + matrix[1][2] * y + matrix[2][2] * z + matrix[3][2]) * w
    ] as vec3;
  }
};
