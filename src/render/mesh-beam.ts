import * as THREE from "three";
//@ts-ignore
import fs from "!raw-loader!./shaders/beam/shader.frag";
//@ts-ignore
import vs from "!raw-loader!./shaders/beam/shader.vert";


import { BeamParams } from "../geometry/beam";


import BeamSolver from "../compute/beam";

export interface Uniform {
	value: number;
	next_value: number;
}

export interface UniformObject {
	[key: string]: Uniform;
}

function beamparams2uniforms(beamparams: BeamParams) {
	let uniforms: UniformObject = {};
	for (const key in beamparams) {
		uniforms[key] = {
			value: Number(beamparams[key].value),
			next_value: Number(beamparams[key].value)
		};
	}
	return uniforms;
}

function uni(val: number | string) {
	return {
		value: Number(val),
		next_value: Number(val)
	};
}
export interface MeshBeamParams {
	params: BeamParams;
	running?: boolean;
    timestep?: number;
    resolution?: number;
    f?: (x:number) => number;
    g?: (x:number) => number;
}
export default class MeshBeam {
	closedSpline: THREE.CatmullRomCurve3;
	mesh: THREE.Mesh;
	solver: BeamSolver;
	uniforms: UniformObject;
	running: boolean;
	timestep: number;
	constructor(params: MeshBeamParams) {
		this.running = params.running || false;
		this.timestep = params.timestep || 1e-5;
		const L = Number(params.params.length.value);
		const pi = Math.PI;
		const f = params.f || (x => 0.001 * Math.sin((pi * x) / L));
		const g = params.g || (x => 0);
		this.solver = new BeamSolver(params.params, f, g);

		this.closedSpline = new THREE.CatmullRomCurve3([
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(1, 0, 0)
		]);

		const extrudeSettings = {
			steps: params.resolution || 50,
			bevelEnabled: false,
			extrudePath: this.closedSpline
		};

		let pts: THREE.Vector2[] = [
			new THREE.Vector2(-1, -1),
			new THREE.Vector2(-1, 1),
			new THREE.Vector2(1, 1),
			new THREE.Vector2(1, -1)
		];

		var shape = new THREE.Shape(pts);
		var geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
		const displacement = new Float32Array(
			geometry.getAttribute("position").count
		);
		const pos = geometry.getAttribute("position");
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i) * Number(this.solver.params.length.value);
			
			displacement[i] = this.solver.u(x, 0);
			
		}
		

		
		geometry.setAttribute(
			"displacement",
			new THREE.BufferAttribute(displacement, 1, false)
		);

		this.uniforms = beamparams2uniforms(params.params);
		this.uniforms.pi = uni(Math.PI);
		this.uniforms.time = uni(0);
		this.uniforms.amplitude = uni(this.solver.amplitude);

		
		var shaderMaterial = new THREE.ShaderMaterial({
			wireframe: true,
			side: THREE.DoubleSide,
			uniforms: this.uniforms,
			vertexShader: vs,
			fragmentShader: fs
		});

		this.mesh = new THREE.Mesh(geometry, shaderMaterial);
		this.mesh.userData.params = params;

	}


	updateParameter(id: string, value: string, submit: boolean = false) {
		this.uniforms[id].next_value = Number(value);
		submit && this.submitUniforms();
	}
	setUniform(uniforms: BeamParams) {
		for (const key in uniforms) {
			this.uniforms[key].next_value = Number(uniforms[key]);
		}
	}
	submitUniforms() {
		console.log("submitting")
		for (const key in this.uniforms) {
			this.uniforms[key].value = this.uniforms[key].next_value;
			if (this.solver.params[key]) {
				if (key !== "f" && key !== "g") {
					this.solver.params[key].value = String(this.uniforms[key].value);
				}
			}
			const { u, amplitude } = this.solver.solve(this.solver.f, this.solver.g);
			this.solver.u = u;
			this.solver.amplitude = amplitude;
		}
	}
	resetTime() {
		this.uniforms.time.value = 0;
	}
    step() {
        if (!this.running) {
            return;
        }
        const t = (this.uniforms.time.value += this.uniforms.timestep.value);
		const pos = (this.mesh.geometry as THREE.BufferGeometry).getAttribute(
			"position"
		);
		const disp = (this.mesh.geometry as THREE.BufferGeometry).getAttribute(
			"displacement"
		);

		
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i) * Number(this.solver.params.length.value);
			disp.setX(i, this.solver.u(x, t));
			
		}
		//@ts-ignore;
		disp.needsUpdate = true;
    }
}
