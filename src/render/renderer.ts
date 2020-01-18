import * as THREE from "three";
//@ts-ignore
import fs from "!raw-loader!./shaders/beam/shader.frag";
//@ts-ignore
import vs from "!raw-loader!./shaders/beam/shader.vert";
import { AudioRenderer } from './audio';

var OrbitControls = require('./orbit-controls.js')(THREE);

import MeshBeam from './mesh-beam';
import { BeamParams } from "../geometry/beam";
import { CameraStore } from '../common/storage-schemas';

import BeamSolver from '../compute/beam';

// Object.assign(window, {
//   THREE
// })

export interface RendererConfig{
  running?: boolean;
  timestep?: number;
}

export default class Renderer {
  elt: HTMLCanvasElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.Renderer;
  time: number;
  controls;
  beam: MeshBeam;
  temppos;
  _running: boolean;
  _timestep: number;
  audiorenderer: AudioRenderer;
  constructor(elt: HTMLCanvasElement, params: BeamParams, config: RendererConfig) {
    
    this._running = config.running || false;
    this._timestep = config.timestep || 1e-5;
    const L = Number(params.length.value);
    const pi = Math.PI;
    const f = x => x/100;
    const g = x => 0;
    
    this.beam = new MeshBeam({
      params,
      f,
      g,
      running: this._running,
      timestep: this._timestep,
      resolution: 50
    });
    
    this.elt = elt; 
    this.scene = new THREE.Scene();
    const clientwidth = (elt.parentElement as HTMLDivElement).clientWidth;
    const clientheight = (elt.parentElement as HTMLDivElement).clientHeight;
    const aspect = clientwidth / clientheight;
    const fov = 25;
    const far = 1000;
    const near = 0.0001;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.elt,
      antialias: true
    });

    this.renderer.setSize(clientwidth,clientheight);
    const pixelRatio = window.devicePixelRatio;
    //@ts-ignore
    this.renderer.setPixelRatio(pixelRatio);
    this.render = this.render.bind(this);

    this.time = 0;
    // this.scene.add(new THREE.GridHelper(1000, 1000));
    this.scene.background = new THREE.Color("#f6f6f6");
    
    const storedState = JSON.parse(localStorage.getItem("camera")||"{}") as CameraStore;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);
    if (storedState) {
      if (storedState.object) {
        this.camera.position.set(
          storedState.object.matrix[12],
          storedState.object.matrix[13],
          storedState.object.matrix[14]
        );
      }
    }
    this.controls.update();


    this.scene.add(this.beam.mesh);
    // this.scene.add(new THREE.GridHelper(100, 100));
    this.setupEventListeners();
    this.render();
    
    this.audiorenderer = new AudioRenderer();
    
  }
  get running() {
    return this._running;
  }
  set running(__running: boolean) {
    this._running = __running;
    this.beam.running = this._running;
  }
  get timestep() {
    return this._timestep;
  }
  set timestep(ts: number) {
    this._timestep = ts;
    this.beam.timestep = this._timestep;
  }
  setupEventListeners () {
    window.addEventListener("mouseup", (e) => {
      localStorage.setItem("camera", JSON.stringify(this.camera.toJSON()));
    })
  }
  resize() {
    this.renderer.setSize(
      this.renderer.domElement.parentElement?.clientWidth || 0,
      this.renderer.domElement.parentElement?.clientHeight || 0
    );
  }
  resizeCanvasToDisplaySize() {
    const canvas = this.renderer.domElement;
    // look up the size the canvas is being displayed
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // adjust displayBuffer size to match
    if (canvas.width !== width || canvas.height !== height) {
      // you must pass false here or three.js sadly fights the browser
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      // update any render target sizes here
    }
  }
  checkresize() {
    if (
      this.renderer.domElement.width !==
        this.renderer.domElement.parentElement?.clientWidth ||
      0 ||
      this.renderer.domElement.height !==
        (this.renderer.domElement.parentElement?.clientHeight || 0)
    ) {
      this.resize();
    }
  }
  updateParameter(id: string, value: string, submit: boolean = false) {
    this.beam.uniforms[id].next_value = Number(value);
    submit && this.submitUniforms();
  }
  setUniform(uniforms: BeamParams) {
    for (const key in uniforms) {
      this.beam.uniforms[key].next_value = Number(uniforms[key]);
    }
  }
  updateFG(id: string, fn: (x: number) => number) {
    this.beam.solver[id] = fn;
    this.submitUniforms();
  }
  submitUniforms() {
    console.log("submitting");
    for (const key in this.beam.uniforms) {
      if (key !== "f" && key !== "g") {
        this.beam.uniforms[key].value = this.beam.uniforms[key].next_value;
      }
    }
    this.beam.submitUniforms();
    console.log(this.beam.uniforms)
  }
  render() {
    this.resizeCanvasToDisplaySize();
    this.beam.step();
    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
  }
}
