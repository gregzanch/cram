export const camera = {
	metadata: {
		version: 4.5,
		type: "Object",
		generator: "Object3D.toJSON"
	},
	object: {
		uuid: "5C0F06A0-7840-4E25-BC3E-D89BDE9FC751",
		type: "PerspectiveCamera",
		layers: 1,
		matrix: [
			0.9865227300450198,
			0.1636242741909678,
			-2.7755575615628914e-17,
			0,
			-0.04441440408326102,
			0.26778312317158637,
			0.9624549650006486,
			0,
			0.15748099508972446,
			-0.949483699617824,
			0.27144141236296304,
			0,
			17.09256526213967,
			-45.12563348939184,
			15.073592779879819,
			1
		],
		fov: 25,
		zoom: 1,
		near: 0.0001,
		far: 500,
		focus: 10,
		aspect: 2.3666666666666667,
		filmGauge: 35,
		filmOffset: 0
	}
};

export default {
	camera: JSON.stringify(camera)
};
