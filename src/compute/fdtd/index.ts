//@ts-nocheck
import { GPU, Kernel, Input, IKernelFunctionThis } from "gpu.js";
import Room from "../../objects/room";
import * as THREE from "three";
import Solver from "../solver";
import Surface from "../../objects/surface";
import Source from "../../objects/source";
import Receiver from "../../objects/receiver";
import defaults from './defaults';

import image from '../../res/sprites/circle.png';
import shader from './shader';

const { ceil, round, floor, abs } = Math;

interface Thread {
	x: number,
	y: number,
	z: number;
}



export interface FDTDParams {
	room: Room;
	gain: number;
	threshold: number;
	dx: number;
	dt: number;
	sources: Source[];
	receivers: Receiver[];
	q: number;
	r: number;
}

export class FDTD extends Solver {
	running: boolean;
	clearpass: boolean;
	n: number;
	t: number;
	
	room!: Room;
	private _gain!: number;
	private _threshold!: number;
	dx!: number;
	dt!: number;
	sources!: Source[];
	receivers!: Receiver[];
	q!: number;
	r!: number;
	
	u!: Float32Array[];
	f!: Float32Array;
	lx: number;
	ly: number;
	lz: number;
	nz: number;
	ny: number;
	nx: number;
	N: number;
	
	sourceLocations: number[][];
	
	gpu!: GPU;
	kernel!: Kernel;
	
	mesh!: THREE.Mesh;
	geometry!: THREE.InstancedBufferGeometry;
	pressureAttribute!: THREE.InstancedBufferAttribute;
	material!: THREE.RawShaderMaterial;
	constructor(params?: FDTDParams) {
		super(params);
		this.kind = "fdtd";
		this.n = 0;
		this.t = 0;
		
		this.running = false;
		this.clearpass = false;
		
		for (const key in defaults) {
			this[key] = (params && params[key]) || defaults[key];
		}
		const { x: lx, y: ly, z: lz } = { ...this.room.boundingBox.getSize(new THREE.Vector3()) };
		this.lx = lx;
		this.ly = ly;
		this.lz = lz;
		this.nx = ceil(this.lx / this.dx);
		this.ny = ceil(this.ly / this.dx);
		this.nz = ceil(this.lz / this.dx);
		this.N = this.nx * this.ny * this.nz;
		this.sourceLocations = [];
		for (let i = 0; i < this.sources.length; i++) {
			this.sourceLocations.push([
				round((this.sources[i].x * this.nx) / this.lx),
				round((this.sources[i].y * this.ny) / this.ly),
				round((this.sources[i].z * this.nz) / this.lz)
			]);
		}
		this.reset();
		this.initKernel(params);
		this.initRenderItems();
	}
	get threshold() {
		return this._threshold;
	}
	set threshold(threshold: number) {
		this._threshold = threshold;
		this.material && (this.material.uniforms["threshold"].value = this._threshold);
	}
	get gain() {
		return this._gain;
	}
	set gain(gain: number) {
		this._gain = gain;
		this.material && (this.material.uniforms["gain"].value = this._gain);
	}
	initKernel() {

		this.gpu = new GPU({
			mode: "webgl2",

    });
	
		function kernelFunction(
      this: IKernelFunctionThis,
      prev: number[][][],
      curr: number[][][],
			f: number[][][],
      q: number,
      r: number,
      dx: number,
      dt: number,
      nx: number,
      ny: number,
      nz: number
		): number {
						let u_prev = prev[this.thread.z][this.thread.y][this.thread.x];
						let u_center = curr[this.thread.z][this.thread.y][this.thread.x];
						let u_right = curr[this.thread.z][this.thread.y][this.thread.x + 1];
						let u_left = curr[this.thread.z][this.thread.y][this.thread.x - 1];
						let u_front = curr[this.thread.z][this.thread.y + 1][this.thread.x];
						let u_back = curr[this.thread.z][this.thread.y - 1][this.thread.x];
						let u_top = curr[this.thread.z + 1][this.thread.y][this.thread.x];
						let u_bottom = curr[this.thread.z - 1][this.thread.y][this.thread.x];
						let f_center = f[this.thread.z][this.thread.y][this.thread.x];
						let grad_x = (q + q) * (u_right - u_center) - (q + q) * (u_center - u_left);
						let grad_y = (q + q) * (u_front - u_center) - (q + q) * (u_center - u_back);
						let grad_z = (q + q) * (u_top - u_center) - (q + q) * (u_center - u_bottom);
						let grad = grad_x + grad_y + grad_z;

						let coef = 1.0 / (2.0 * r * dx * dx);
						
						return coef * grad + 2.0 * u_center - u_prev + dt * dt * f_center;
				}
		this.kernel = this.gpu
			.createKernel<typeof kernelFunction>(kernelFunction)

			.setOutput([this.N])

	}
	satisfyBounds() {
		for (let i = 0; i < this.nx; i++){
			for (let j = 0; j < this.ny; j++){
				this.u[this.curr][this.getIndex(i, j, 0)] = 0;
				this.u[this.curr][this.getIndex(i, j, this.nz-1)] = 0;
			}
		}
		for (let i = 0; i < this.nx; i++){
			for (let k = 0; k < this.nz; k++){
				this.u[this.curr][this.getIndex(i, 0, k)] = 0;
				this.u[this.curr][this.getIndex(i, this.ny-1, k)] = 0;
			}
		}
		for (let j = 0; j < this.ny; j++){
			for (let k = 0; k < this.nz; k++){
				this.u[this.curr][this.getIndex(0, j, k)] = 0;
				this.u[this.curr][this.getIndex(this.nx-1, j, k)] = 0;
			}
		}
	}
	reset() {
		this.t = 0;
		this.n = 0;
		this.u = [
			new Float32Array(this.N),
			new Float32Array(this.N),
		];
		this.f = new Float32Array(this.N);
		for (let i = 0; i < this.N; i++){
			this.u[0][i] = 0;
			this.u[1][i] = 0;
			this.f[i] = 0;
		}

		for (let i = 0; i < this.sourceLocations.length; i++){
			this.f[
				this.getIndex(
					this.sourceLocations[i][0],
					this.sourceLocations[i][1],
					this.sourceLocations[i][2]
				)
			] = this.sources[i].f(0);
		}
	}
	getIndex(i, j, k) {
		return i * this.ny * this.nz + j * this.nz + k;
	}
	get3DIndex(i) {
		return [
			floor(i/(this.ny*this.nz))%this.nx,
			floor(i/(this.nz))%this.ny,
			i%this.nz,
		]
	}
	get curr() {
		return (this.n + 1) % 2;
	}
	get prev() {
		return this.n % 2;
	}
	clear() {
		this.clearpass = true;
		if (this.running) {
		}
	}

	update = () => {
		if (this.running || this.clearpass) {
			this.satisfyBounds();
			this.step();
		}
		// console.log(this.running);
	}
	updateSources() {
		for (let i = 0; i < this.sourceLocations.length; i++) {
					// console.log(this.sources[i].f(this.t))
          this.f[
            this.getIndex(
              this.sourceLocations[i][2],
              this.sourceLocations[i][1],
              this.sourceLocations[i][0]
            )
					] = this.sources[i].f(this.t);
			// console.log(
      //   this.f[
      //     this.getIndex(
      //       this.sourceLocations[i][2],
      //       this.sourceLocations[i][1],
      //       this.sourceLocations[i][0]
      //     )
      //   ]
			// );
			// console.log(this.sourceLocations[i]);
        }
	}
	step() { 
		if (this.clearpass) {
			this.reset();
			return
		}
		
		//@ts-ignore
		this.u[this.prev] = this.kernel(
      //@ts-ignore
      new Input(this.u[this.prev], [this.nz, this.ny, this.nx]),
      //@ts-ignore
      new Input(this.u[this.curr], [this.nz, this.ny, this.nx]),
      //@ts-ignore
			new Input(this.f, [this.nz, this.ny, this.nx]),
      this.q,
      this.r,
      this.dx,
      this.dt,
      this.nx,
      this.ny,
      this.nz
		);
		
		this.t += this.dt;
		// console.log(this.sources[0].f(this.t))
		this.n++;

		// this.gain = 
		
		this.updateSources();
		// this.satisfyBounds();
		this.pressureAttribute.set(this.u[this.curr], 0);
		//@ts-ignore
		this.room.getFDTDPressureAttribute().needsUpdate=true
	}
	initRenderItems() {
		const boxGeometry = new THREE.CircleBufferGeometry(.1, 6);
		this.geometry = new THREE.InstancedBufferGeometry();
		this.geometry.index = boxGeometry.index;
		this.geometry.attributes = boxGeometry.attributes;
		const translateArray = new Float32Array(this.N*3);
		let c = 0;
		for (let i = 0; i < this.nx; i++){
			for (let j = 0; j < this.ny; j++){
				for (let k = 0; k < this.nz; k++){
					let index = this.getIndex(i,j,k) * 3;
					translateArray[index+0] = (i / this.nx) * this.lx + this.dx/2;
					translateArray[index+1] = (j / this.ny) * this.ly + this.dx/2;
					translateArray[index + 2] = (k / this.nz) * this.lz + this.dx/2;
					c++;
				}
			}
		}
		this.pressureAttribute = new THREE.InstancedBufferAttribute(this.u[this.curr],1);
		this.pressureAttribute.setUsage(THREE.DynamicDrawUsage);

		this.geometry.setAttribute("translate", new THREE.InstancedBufferAttribute(translateArray, 3));
		this.geometry.setAttribute("pressure", new THREE.InstancedBufferAttribute(this.u[this.curr],1))
		this.material = new THREE.RawShaderMaterial({fog:false,
      uniforms: {
        map: {
          value: new THREE.TextureLoader().load(image)
        },
				time: { value: 0.0 },
				threshold: { value: this.threshold },
				gain: { value: this.gain }
			},
			
			vertexShader: shader.vs,
			fragmentShader: shader.fs,
			transparent: true,
			alphaTest: 1.0,
			depthTest: true,
      depthWrite: true
		});
		
		this.mesh = new THREE.Mesh(this.geometry, this.material);

		
		this.room.setFDTD(this.mesh);

	}

	// subdivide() {
	// 	const { min, max } = this.room.boundingBox;
	// 	const { x, y, z } = max.sub(min);
	// 	this.N = [
	// 		Math.ceil(x / this.resolution),
	// 		Math.ceil(y / this.resolution),
	// 		Math.ceil(z / this.resolution)
	// 	];
	// 	for (let i = 0; i < this.N[0]; i++) {
	// 		this.elementBoxes.push([]);
	// 		this.meshes.push([]);

	// 		this.u[this.prev].push([]);
	// 		this.u[this.curr].push([]);
	// 		this.u[this.next].push([]);

	// 		this.rho.push([]);
	// 		this.q.push([]);
	// 		this.f.push([]);

	// 		for (let j = 0; j < this.N[1]; j++) {
	// 			this.elementBoxes[i].push([]);
	// 			this.meshes[i].push([]);

	// 			this.u[this.prev][i].push([]);
	// 			this.u[this.curr][i].push([]);
	// 			this.u[this.next][i].push([]);

	// 			this.rho[i].push([]);
	// 			this.q[i].push([]);
	// 			this.f[i].push([]);

	// 			for (let k = 0; k < this.N[2]; k++) {
	// 				this.u[this.prev][i][j][k] = 0;
	// 				this.u[this.curr][i][j][k] = 0;
	// 				this.u[this.next][i][j][k] = 0;

	// 				this.rho[i][j][k] = 1.25;
	// 				this.q[i][j][k] = 1000;
	// 				this.f[i][j][k] = 0;

	// 				const box = new THREE.Box3().setFromCenterAndSize(
	// 					new THREE.Vector3(
	// 						min.x + i * this.resolution,
	// 						min.y + j * this.resolution,
	// 						min.z + k * this.resolution
	// 					),
	// 					new THREE.Vector3().setScalar(this.resolution)
	// 				);
	// 				this.elementBoxes[i][j][k] = box;
	// 				this.meshes[i][j][k] = new THREE.Mesh(
	// 					new THREE.BoxBufferGeometry(
	// 						this.resolution,
	// 						this.resolution,
	// 						this.resolution
	// 					),
	// 					new THREE.MeshBasicMaterial({fog:false,
	// 						color: 0,
	// 						transparent: true,
	// 						opacity: 0.0
	// 					})
	// 				);

	// 				const center = box.getCenter(new THREE.Vector3());
	// 				this.meshes[i][j][k].position.set(
	// 					center.x,
	// 					center.y,
	// 					center.z
	// 				);
	// 				this.room.add(this.meshes[i][j][k]);
	// 				let intersects = false;
	// 				for (
	// 					let s = 0;
	// 					s < this.room.surfaces.children.length;
	// 					s++
	// 				) {
	// 					if (this.room.surfaces.children[s] instanceof Surface) {
	// 						for (
	// 							let v = 0;
	// 							v <
	// 							(this.room.surfaces.children[s] as Surface)
	// 								._triangles.length;
	// 							v++
	// 						) {
	// 							if (
	// 								box.intersectsTriangle(
	// 									(this.room.surfaces.children[
	// 										s
	// 									] as Surface)._triangles[v]
	// 								)
	// 							) {
	// 								intersects = true;
	// 							}
	// 						}
	// 					}
	// 				}
	// 				if (intersects) {
	// 					// this.C[i][j][k]=0
	// 				}
	// 			}
	// 		}
	// 	}
	// }
}
