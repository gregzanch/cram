export const camera = {
  metadata: {
    version: 4.5,
    type: "Object",
    generator: "Object3D.toJSON"
  },
  object: {
    type: "OrthographicCamera",
    layers: 1,
    matrix: [
      -1,
      1.3038123687736408e-11,
      0,
      0,
      1.3038703289957173e-17,
      0.0000010000444543578624,
      0.9999999999995,
      0,
      1.3038123687729889e-11,
      0.9999999999995,
      -0.0000010000444543578624,
      0,
      15.162523753858894,
      45.667823856530894,
      4.375393066772595,
      1
    ],
    zoom: 31.082679163805285,
    left: -575,
    right: 575,
    top: 412,
    bottom: -412,
    near: 0.001,
    far: 500,
    quat: [4.609675141711988e-12, 0.7071071347555667, 0.7071064276173515, 4.6096705318342304e-12],
    pos: [15.162523753858894, 45.667823856530894, 4.375393066772595],
    target: [15.162523753338647, 5.765843396335449, 4.375432970526877]
  }
};

export const orientationControl = {
  width: 180,
  height: 180,
  axis: "none"
};

export default {
  camera: JSON.stringify(camera),
  orientationControl: JSON.stringify(orientationControl)
};
