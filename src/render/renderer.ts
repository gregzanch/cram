import * as THREE from "three";
//@ts-ignore
// import fs from "!raw-loader!./shaders/beam/shader.frag";
//@ts-ignore
// import vs from "!raw-loader!./shaders/beam/shader.vert";
// import { AudioRenderer } from './audio';
import { THREEGLTFLoader, THREEDracoLoader } from "three-loaders";
import { CameraStore } from '../common/storage-schemas';

const OrbitControls = require('./orbit-controls.js')(THREE);
const STLLoader = require('three-stl-loader')(THREE);
const PLYLoader = require("three-ply-loader")(THREE);

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

//@ts-ignore
import speakerModel from "!raw-loader!../res/models/speaker.gltf";
//@ts-ignore
import micModel from "!raw-loader!../res/models/mic.gltf";

import Source from '../objects/source';
import Receiver from '../objects/receiver';


import Container from '../objects/container';

import Grid from './grid';

export default class Renderer {
  elt!: HTMLCanvasElement;
  renderer!: THREE.Renderer;
  camera!: THREE.PerspectiveCamera;
  
  scene!: THREE.Scene;
  env!: Container;
  workspace!: Container;
  
  lightGroup!: Container;
  helperGroup!: Container;
  
  sourceGroup!: Container;
  sourceTemplate!: Container;
  
  receiverGroup!: Container;
  receiverTemplate!: Container;
  
  geometryGroup!: Container;
  controls;
  
  workspaceCursor!: THREE.Object3D;
  fog!: THREE.FogExp2 | THREE.Fog;
  
  grid!: Grid;
  
  constructor(elt?: HTMLCanvasElement) {
    elt && this.init(elt);
  }
  init(elt: HTMLCanvasElement) {
    this.elt = elt;

		this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf5f8fa);
    
    // this.fog = new THREE.FogExp2(0xf5f8fa, 0.001);
    
    
    this.env = new Container("env");
    this.lightGroup = new Container("lightGroup");
    this.lightGroup.add(new THREE.AmbientLight(0xffffff, 10));
    const light = new THREE.DirectionalLight(0xffffff, 5);
    this.lightGroup.add(light);
    this.env.add(this.lightGroup);
    
    this.helperGroup = new Container("helperGroup");
    this.helperGroup.add(new THREE.GridHelper(1000, 1000, 0xd4d6d8, 0xe4e7e8));
    this.env.add(this.helperGroup);
    
    // this.env.add(new Grid(100,100,2,2))
    
    this.workspace = new Container("workspace", {});
    
    this.scene.add(this.env, this.workspace);
    
    

    this.workspaceCursor = this.workspace;
    
		this.sourceTemplate = new Container("sourceTemplate");
		// this.sourceGroup = new Container("sourceGroup");
		// this.scene.add(this.sourceGroup);

		this.receiverTemplate = new Container("receiverTemplate");
		// this.receiverGroup = new Container("receiverGroup");
		// this.scene.add(this.receiverGroup);
    

		this.setupTemplates();

		const fov = 25;
		const far = 500;
		const near = 0.0001;
    this.camera = new THREE.PerspectiveCamera(fov, this.aspect, near, far);
    const foglen = 100;
    this.fog = new THREE.Fog(0xf5f8fa, far - foglen, far);
    this.scene.fog = this.fog;
    
    
    this.helperGroup
    
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.elt,
			antialias: true
		});

		this.renderer.setSize(this.clientWidth, this.clientHeight);
		const pixelRatio = window.devicePixelRatio;
		//@ts-ignore
		this.renderer.setPixelRatio(pixelRatio);
    this.render = this.render.bind(this);
    

		const storedState = JSON.parse(
			localStorage.getItem("camera") || "{}"
		) as CameraStore;
		this.controls = new OrbitControls(
			this.camera,
			this.renderer.domElement
		);
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

		this.setupEventListeners();
		this.render();
    
  }
  setupTemplates() {
    const loader = new GLTFLoader();
		loader.parse(speakerModel, "", res =>
				res.scene.children.forEach(child => {
					this.sourceTemplate.add(child);
				})
    );
    loader.parse(micModel, "", res =>
      res.scene.children.forEach(child => {
        this.receiverTemplate.add(child);
      })
	  );
  }
  private get clientWidth() {
    return (this.elt.parentElement as HTMLDivElement).clientWidth;
  }
  private get clientHeight() {
    return (this.elt.parentElement as HTMLDivElement).clientHeight;
  }
  private get aspect() {
    return this.clientWidth / this.clientHeight;
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
  
  add(obj: THREE.Object3D) {
    this.workspaceCursor.add(obj);
  }
   
  render() {
    this.resizeCanvasToDisplaySize();
    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
  }
}
