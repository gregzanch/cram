export const camera = {
	metadata: {
		version: 4.5,
		type: "Object",
		generator: "Object3D.toJSON"
	},
	object: {
		type: "PerspectiveCamera",
		layers: 1,
		pos: [-25, -5, 18],
		quat: [0.5107911926040906, -0.24667491182053727, -0.358141362070794, 0.741605427576213],
		fov: 25,
		zoom: 1,
		near: 0.0001,
		far: 500,
		focus: 10,
		aspect: 2.3666666666666667,
		filmGauge: 35,
		filmOffset: 0,
		target: [0,0,0]
	}
};

export default {
	camera: JSON.stringify(camera)
};
