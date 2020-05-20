
import * as THREE from 'three';
import Solver, { SolverParams } from './solver';
import shader from './volume';
import Room from '../objects/room';



export interface GLFDTDParams extends SolverParams {
  dx: number;
  length: number;
  width: number;
  height: number;
  dt: number;
  room: Room;
}

export default class GLFDTD extends Solver {
  length: number;
  width: number;
  height: number;
  dx: number;
  dt: number;
  t: number;
  step: number;
  m: number;
  nx: number;
  ny: number;
  nz: number;
  mesh!: THREE.Mesh;
  texture1!: THREE.DataTexture3D;
  texture2!: THREE.DataTexture3D;
  room: Room;
  constructor(params: GLFDTDParams) {
    super(params);
    this.length = params.length;
    this.width = params.width;
    this.height = params.height;
    this.dx = params.dx;
    this.dt = params.dt;
    this.t = 0;
    this.step = 0;
    this.nx = Math.ceil(this.length / this.dx);
    this.ny = Math.ceil(this.length / this.dx);
    this.nz = Math.ceil(this.length / this.dx);
    this.m = this.nx * this.ny * this.nz;
    this.room = params.room;
    this.init();
    this.room.add(this.mesh);

  }
  reset() {
  
  }
  init() {
    let data1 = new Float32Array(this.m);
    let data2 = new Float32Array(this.m);
    for (let i = 0; i < this.m; i++) {
      data1[i] = Math.random();
      data2[i] = Math.random();
		}
    this.texture1 = new THREE.DataTexture3D(data1, this.nx, this.ny, this.nz);
    this.texture1.format = THREE.AlphaFormat;
    this.texture1.type = THREE.FloatType;

    
    this.texture2 = new THREE.DataTexture3D(data2, this.nx, this.ny, this.nz);
    this.texture2.format = THREE.AlphaFormat;
    this.texture2.type = THREE.FloatType;
    
    var material = new THREE.ShaderMaterial({fog:false,
		uniforms: {
        prev: this.texture1,
        curr: this.texture2,
        nxyz: new THREE.Vector3(this.nx, this.ny, this.nz),
        dx: this.dx,
        dt: this.dt,
        u_length: this.length,
        u_width: this.width,
        u_height: this.height
      },
      // transparent: true,
			// opacity: 0.1,
			side: THREE.FrontSide,
			// metalness: 0.05,
			// reflectivity: 0.15,
			// roughness: 0.3,
			// color: 0xaaaaaa,
			depthWrite: false,
			depthTest: false,
		vertexShader: shader.vs,
		fragmentShader: shader.fs
	});
    var geometry = new THREE.BoxBufferGeometry(this.length, this.width, this.height); 
    const { x, y, z } = this.room.boundingBox.getCenter(new THREE.Vector3());
    geometry.translate(x, y, z);
    this.mesh = new THREE.Mesh(geometry, material);
    
  }
}
