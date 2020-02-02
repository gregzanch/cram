"use strict";
const m4 = twgl.m4;
twgl.setDefaults({ attribPrefix: "a_" });

const gl = twgl.getContext(document.getElementById("c"));
console.log("using: " + gl.getParameter(gl.VERSION)); // eslint

const resolution = 32;

const texture = twgl.createTexture(gl, {
	target: gl.TEXTURE_3D,
	width: resolution,
	height: resolution,
	depth: resolution,
	wrap: gl.CLAMP_TO_EDGE,
	minMag: gl.NEAREST
});

const maxHistory = 32;
const history = [];
let historyNdx = 0;
const ctxs = [];

function drawCircleLow({ context, color, x, y, z, radiusd }) {
	context.drawImage(img, 0, 0);
	gl.bindTexture(gl.TEXTURE_3D, texture);
	gl.texSubImage3D(
		gl.TEXTURE_3D,
		0,
		0,
		0,
		z,
		context.canvas.width,
		context.canvas.height,
		1,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		context.canvas
	);
}

function ddrawCircle(z, color, x, y, radius) {
	const old = history[historyNdx];
	if (old) {
		const ctx = ctxs[old.z];
		const params = {
			context: ctx,
			color: "rgba(0,0,0,1)",
			x: old.x,
			y: old.y,
			z: old.z,
			radius: old.radius + 1
		};
		ctx.globalCompositeOperation = "destination-out";
		drawCircleLow(params);
		ctx.globalCompositeOperation = "source-over";
	}
	drawCircleLow({ context: ctxs[z], color, x, y, z, radius });
	history[historyNdx] = {
		x: x,
		y: y,
		z: z,
		radius: radius
	};
	historyNdx = (historyNdx + 1) % maxHistory;
}

for (let y = 0; y < resolution; ++y) {
	const v = y / (resolution - 1);
	const img = document.querySelector("img");
	const ctx = document.createElement("canvas").getContext("2d");
	ctx.canvas.width = resolution;
	ctx.canvas.height = resolution;
	ctx.drawImage(img, 0, 0);
	ctxs.push(ctx);
}

const vs = `
#version 300 es

in vec4 a_position;
in vec3 a_texcoord;
in vec3 a_normal;

out vec3 v_texcoord;
out vec3 v_normal;
out vec3 v_surfaceToLight;
out vec3 v_surfaceToView;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;
uniform mat4 u_viewInverse;
uniform vec3 u_lightWorldPos;

void main() {
  v_texcoord = a_texcoord;
  v_normal = (u_world * vec4(a_normal, 0)).xyz;
  v_surfaceToLight = u_lightWorldPos - (u_world * a_position).xyz;
  v_surfaceToView = (u_viewInverse[3] - (u_world * a_position)).xyz;
  gl_Position = u_worldViewProjection * a_position;
}
`;

const fs = `
#version 300 es
precision mediump float;
precision mediump sampler3D;

in vec3 v_texcoord;
in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToView;

uniform sampler3D u_volume;
uniform vec3 u_lightDir;
uniform float u_shininess;
uniform float u_specularFactor;
uniform float u_alphaThreshold;

out vec4 outColor;

vec4 lit(float l ,float h, float m) {
  return vec4(1.0,
              mix(0.5, 1., l * .5 + .5),
              (l > 0.0) ? pow(max(0.0, h), m) : 0.0,
              1.0);
}

void main() {
  vec4 color = texture(u_volume, v_texcoord);
  if (color.a < u_alphaThreshold) {
    discard;
  }

  vec3 a_normal = normalize(v_normal);
  vec3 surfaceToLight = normalize(v_surfaceToLight);
  vec3 surfaceToView = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLight + surfaceToView);
  vec4 litR = lit(dot(a_normal, surfaceToLight),
                    dot(a_normal, halfVector), u_shininess);

  outColor = vec4((
     (color * litR.y + vec4(1) * litR.z)).rgb,
      color.a);
}
  `;

// generate 3d planes
const positions = [];
const texcoords = [];
const normals = [];

function addPoint(mapping, p, t, n) {
	positions.push(p[mapping[0]], p[mapping[1]], p[mapping[2]]);
	texcoords.push(t[mapping[0]], t[mapping[1]], t[mapping[2]]);
	normals.push(n[mapping[0]], n[mapping[1]], n[mapping[2]]);
}

for (let y = 0; y <= resolution; ++y) {
	const w0 = (y + 0) / resolution;
	const w1 = (y + 1) / resolution;

	const u0 = 0;
	const u1 = 1;
	const v0 = 0;
	const v1 = 1;

	const u0b = 0;
	const u1b = 1;
	const v0b = 0;
	const v1b = 1;
	const w0b = (y + 0.01) / resolution;
	const w1b = (y + 0.99) / resolution;

	[
		[0, 1, 2],
		[1, 2, 0],
		[2, 0, 1]
	].forEach(mapping => {
		addPoint(
			mapping,
			[u0 - 0.5, w0 - 0.5, v0 - 0.5],
			[u0b, w0b, v0b],
			[0, -1, 0]
		);
		addPoint(
			mapping,
			[u1 - 0.5, w0 - 0.5, v0 - 0.5],
			[u1b, w0b, v0b],
			[0, -1, 0]
		);
		addPoint(
			mapping,
			[u0 - 0.5, w0 - 0.5, v1 - 0.5],
			[u0b, w0b, v1b],
			[0, -1, 0]
		);
		addPoint(
			mapping,
			[u0 - 0.5, w0 - 0.5, v1 - 0.5],
			[u0b, w0b, v1b],
			[0, -1, 0]
		);
		addPoint(
			mapping,
			[u1 - 0.5, w0 - 0.5, v0 - 0.5],
			[u1b, w0b, v0b],
			[0, -1, 0]
		);
		addPoint(
			mapping,
			[u1 - 0.5, w0 - 0.5, v1 - 0.5],
			[u1b, w0b, v1b],
			[0, -1, 0]
		);

		addPoint(
			mapping,
			[u0 - 0.5, w1 - 0.5, v0 - 0.5],
			[u0b, w1b, v0b],
			[0, 1, 0]
		);
		addPoint(
			mapping,
			[u0 - 0.5, w1 - 0.5, v1 - 0.5],
			[u0b, w1b, v1b],
			[0, 1, 0]
		);
		addPoint(
			mapping,
			[u1 - 0.5, w1 - 0.5, v0 - 0.5],
			[u1b, w1b, v0b],
			[0, 1, 0]
		);
		addPoint(
			mapping,
			[u0 - 0.5, w1 - 0.5, v1 - 0.5],
			[u0b, w1b, v1b],
			[0, 1, 0]
		);
		addPoint(
			mapping,
			[u1 - 0.5, w1 - 0.5, v1 - 0.5],
			[u1b, w1b, v1b],
			[0, 1, 0]
		);
		addPoint(
			mapping,
			[u1 - 0.5, w1 - 0.5, v0 - 0.5],
			[u1b, w1b, v0b],
			[0, 1, 0]
		);
	});
}

const programInfo = twgl.createProgramInfo(gl, [vs, fs]);
const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
	position: positions,
	normal: normals,
	texcoord: { numComponents: 3, data: texcoords }
});

const uniforms = {
	u_volume: texture,
	u_worldViewProjection: m4.identity(),
	u_lightWorldPos: [0.3, 1.3, -2],
	u_shininess: 1,
	u_alphaThreshold: 0.1
};

const ae = document.querySelector("#alphaThreshold");
ae.value = uniforms.u_alphaThreshold * 100;
ae.addEventListener("input", e => {
	uniforms.u_alphaThreshold = e.target.value / 100;
});

window.zoom = 4;
const ze = document.querySelector("#zoom");
ze.value = window.zoom * 100;
ze.addEventListener("input", e => {
	window.zoom = e.target.value / 100;
});

document.querySelector("#filter").addEventListener("change", e => {
	const mode = e.target.checked ? gl.LINEAR : gl.NEAREST;
	gl.bindTexture(gl.TEXTURE_3D, texture);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, mode);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, mode);
});

let frameCount = 0;
function render(time) {
	time *= 0.001;
	frameCount++;

	const zp = frameCount % (resolution * 2);
	const z = zp >= resolution ? resolution * 2 - zp - 1 : zp;
	const zv = z / (resolution - 1);
	const r =
		Math.abs(Math.sin(time) + Math.cos(time * 0.731)) *
		(resolution / 2) *
		0.5 *
		Math.sin(zv * Math.PI);

	drawCircle(
		z,
		chroma.hsv((time * 30) % 360, 0.75 + Math.sin(time) * 0.25, 0.5).css(),
		resolution / 2 + Math.sin(time * 0.515) * (resolution / 2 - r),
		resolution / 2 + Math.sin(time * 0.413) * (resolution / 2 - r),
		r
	);

	twgl.resizeCanvasToDisplaySize(gl.canvas);

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);

	const fov = (45 * Math.PI) / 180;
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.01;
	const zFar = 10;
	const projection = m4.perspective(fov, aspect, zNear, zFar);

	const ctime = 0; //time * 0.1;
	const cr = 1.2 - window.zoom * 0.7;
	const eye = [Math.sin(ctime) * cr, 1 - window.zoom * 0.9, Math.cos(ctime) * cr];
	const target = [0, 0, 0];
	const up = [0, 1, 0];
	const camera = m4.lookAt(eye, target, up);
	const view = m4.inverse(camera);

	const viewProjection = m4.multiply(projection, view);
	const world = m4.rotationY(time * 0.1);

	uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);
	uniforms.u_world = world;
	uniforms.u_viewInverse = camera;

	gl.useProgram(programInfo.program);

	twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
	twgl.setUniforms(programInfo, uniforms);
	twgl.drawBufferInfo(gl, bufferInfo);

	requestAnimationFrame(render);
}
requestAnimationFrame(render);
