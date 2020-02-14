import * as THREE from "three";
//@ts-ignore
// import fs from "!raw-loader!./shaders/beam/shader.frag";
//@ts-ignore
// import vs from "!raw-loader!./shaders/beam/shader.vert";
// import { AudioRenderer } from './audio';
import { CameraStore } from "../common/storage-schemas";

const OrbitControls = require("./orbit-controls.js")(THREE);
const STLLoader = require("three-stl-loader")(THREE);
const PLYLoader = require("three-ply-loader")(THREE);

import { lerp, lerp3 } from "../common/lerp";
import EasingFunctions from '../common/easing';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

//@ts-ignore
import speakerModel from "!raw-loader!../res/models/speaker.gltf";
//@ts-ignore
import micModel from "!raw-loader!../res/models/mic.gltf";

import whitematcap from './textures/matcap-porcelain-white.jpg';

import Source from "../objects/source";
import Receiver from "../objects/receiver";

import cubicBezier from '../common/cubic-bezier';

import Container from "../objects/container";

import Grid from "./env/grid";
import { KeyValuePair } from "../common/key-value-pair";

import defaults from './defaults';
import Axes from './env/axes';
import Lights from './env/lights';
import Room from '../objects/room';
import { FRAME_RATE } from "../constants";
import Messenger from "../messenger";


import PickHelper from './pick-helper';








export interface RendererParams{
	elt?: HTMLCanvasElement;
	messenger: Messenger;
}

export default class Renderer {
	elt!: HTMLCanvasElement;
	renderer!: THREE.Renderer;

	camera!: THREE.PerspectiveCamera|THREE.OrthographicCamera;
	perspectiveCamera!: THREE.PerspectiveCamera;
	orthoCamera!: THREE.OrthographicCamera

	scene!: THREE.Scene;
	env!: Container;
	workspace!: Container;

	lights!: Lights;
	axes!: Axes;
	grid!: Grid;

	stack!: Array<(...args)=>void>


	settingHandlers!: KeyValuePair<((val: any)=>void)>;
	
	sourceGroup!: Container;
	sourceTemplate!: Container;

	receiverGroup!: Container;
	receiverTemplate!: Container;

	geometryGroup!: Container;
	controls;

	workspaceCursor!: THREE.Object3D;
	fog!: THREE.FogExp2 | THREE.Fog;


  textures!: KeyValuePair<THREE.Texture>
	smoothingCameraFunction!: any;
	smoothingCamera!: boolean;
	messenger: Messenger;
	pickHelper!: PickHelper;
	constructor(params: RendererParams) {
		[
			"init",
			"render",
			"setupCamera",
			"setupFog",
			"setupTemplates",
			"setupTextures",
			"setupRenderer",
			"setupSettingHandlers",
			"setupScene",
			"smoothCameraTo",
			"setOrtho",
			"setControls"
		].forEach(method => {
			this[method] = this[method].bind(this);
		});
		
		
		

		this.messenger = params.messenger;
		
	}
	init(elt: HTMLCanvasElement) {

		this.smoothingCamera = false;
		this.smoothingCameraFunction = undefined;
		
		this.elt = elt;
		this.stack = [] as Array<(...args) => void>;
		this.env = new Container("env");
		this.workspace = new Container("workspace");
		this.workspaceCursor = this.workspace;
		
		this.lights = new Lights();
		this.grid = new Grid();
		this.axes = new Axes();
		
		this.env.add(this.grid, this.lights, this.axes);
		


		this.setupScene({
			background: 0xf5f8fa
		});
		
		this.setupTemplates();

		this.setupRenderer();
		
		this.setupCamera({
			fov: 45,
			aspect: this.aspect,
			near: 0.01,
			far: 500,
			up: [0, 0, 1]
		});
		
		this.pickHelper = new PickHelper(this.scene,this.camera, this.renderer.domElement);
		
		this.setupFog({
			color: this.scene.background,
			start: this.camera.far - 200,
			end: this.camera.far
		});

		


	

		this.setupSettingHandlers();
		this.setupMessageHandlers();

    this.setupTextures();
		this.setupEventListeners();
		this.render();
		// setInterval(this.render, 1000 / 20);
	}

	setupMessageHandlers() {
		this.messenger.addMessageHandler("RENDERER_SHOULD_CHANGE_BACKGROUND", (acc, ...args) => this.background = args[0])
		this.messenger.addMessageHandler("RENDERER_SHOULD_CHANGE_FOG_COLOR", (acc, ...args) => this.fogColor = args[0])
		this.messenger.addMessageHandler("TOGGLE_CAMERA_ORTHO", (acc, ...args) => this.setOrtho(this.camera instanceof THREE.PerspectiveCamera))
	}
	setupScene({background}) {
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(background);
		this.scene.add(this.env, this.workspace);
	}
	setupSettingHandlers() {
		this.settingHandlers = {};
		this.settingHandlers.lightHelpersVisible = (val: boolean) => {
			console.log(val);
			this.lights.setHelpersVisible(val);
		};
	}
	setupRenderer() {
			this.renderer = new THREE.WebGLRenderer({
				canvas: this.elt,
				context: this.elt.getContext("webgl2", { alpha: false })!,
				antialias: true,
				depth: true,
				precision: "mediump"
			});
			//@ts-ignore
			this.renderer.shadowMap.enabled = true;
			//@ts-ignore
			this.renderer.shadowMapSoft = true;

			this.renderer.setSize(this.clientWidth, this.clientHeight);
			const pixelRatio = window.devicePixelRatio;
			//@ts-ignore
			this.renderer.setPixelRatio(pixelRatio);
	}
	setupFog({ color, start, end }) {
		this.fog = new THREE.Fog(color, start, end);
		this.scene.fog = this.fog;

	}
	setupCamera({ fov, aspect, near, far, up }) {
		
		this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		this.perspectiveCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		const canvas = this.renderer.domElement;
		const left = -canvas.width / 2;
    const right = canvas.width / 2;
    const top = canvas.height / 2;
    const bottom = -canvas.height / 2;
		this.orthoCamera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
		this.camera.up.set(up[0], up[1], up[2]);
		
		const storedState = JSON.parse(localStorage.getItem("camera") || defaults.camera) as CameraStore;
		
		if (storedState) {
			if (storedState.object) {
				this.camera.position.set(
					storedState.object.matrix[12],
					storedState.object.matrix[13],
					storedState.object.matrix[14]
				);
				if (this.camera instanceof THREE.PerspectiveCamera) {
					this.camera.fov = storedState.object.fov;
					this.camera.aspect = storedState.object.aspect;
				}
			}
		}

		this.setControls();
		this.controls.update();
	}
	setupTextures() {
		this.textures = {};
    const textureloader = new THREE.TextureLoader();
    textureloader.load(whitematcap, (texture) => {
      this.textures['white-matcap'] = texture;
    });
    
    const tex = new THREE.Texture()
  }
	setupTemplates() {
		this.sourceTemplate = new Container("sourceTemplate");
		this.receiverTemplate = new Container("receiverTemplate");
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
	
	
	
	
	setupEventListeners() {
		window.addEventListener("mouseup", e => {
			if (this.camera instanceof THREE.PerspectiveCamera) {
				localStorage.setItem(
					"camera",
					JSON.stringify(this.camera.toJSON())
				);
			}
		});
		// this.renderer.domElement.addEventListener('mousedown', e => {
		// 	const selection = this.pickHelper.pick(e, [this.workspace]);
		// 	if (selection) {
		// 		this.select(selection);
		// 	}
		// 	// console.log(this.pickHelper);
		// })
		
	}
	
	select(object: Container) {
		this.messenger.postMessage("DESELECT_ALL_OBJECTS");
		object.select();
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
				if (this.camera instanceof THREE.OrthographicCamera) {
          this.camera.left = -canvas.width / 2;
          this.camera.right = canvas.width / 2;
          this.camera.top = canvas.height / 2;
          this.camera.bottom = -canvas.height / 2;
        } else {
          (this.camera as THREE.PerspectiveCamera).aspect = width / height;

        }
			
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
	settingChanged(setting: string, value: any) {
		this.settingHandlers[setting](value);
	}
	addRays(rays: THREE.LineSegments) {
		this.scene.add(rays);
	}
	add(obj: THREE.Object3D) {
		this.workspaceCursor.add(obj);
	}
	
	addRoom(room: Room) {
		this.workspaceCursor.add(room);
		const near =
			room.boundingBox.max
				.clone()
				.sub(room.boundingBox.min)
				.length() * 4;
		const far = near * 2;
		this.setupFog({ color: this.fogColor, start: near, end: far });
	}
	setControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();
	}
	setOrtho(on: boolean) {
		if (on && this.camera instanceof THREE.PerspectiveCamera) {
			const { x, y, z } = this.camera.position.clone();
			this.orthoCamera.position.set(x,y,z)
			this.orthoCamera.setRotationFromQuaternion(this.camera.quaternion);
			this.perspectiveCamera = this.camera.clone();
			this.camera = this.orthoCamera;
			this.camera.up.set(0, 0, 1);
		}
		else if(!on && this.camera instanceof THREE.OrthographicCamera) {
			const { x, y, z } = this.camera.position.clone();
      this.perspectiveCamera.position.set(x, y, z);
			this.perspectiveCamera.setRotationFromQuaternion(this.camera.quaternion);
			this.orthoCamera = this.camera.clone();
			this.camera = this.perspectiveCamera;
			this.camera.up.set(0, 0, 1);
		}
		this.setControls();
	}
	
	smoothCameraTo(
		position: THREE.Vector3,
		target?: THREE.Vector3,
		duration?: number,
		curve?: (t: number) => number
	) {
		const origin = this.camera.getWorldPosition(new THREE.Vector3());
		const timer = new Ticker("inc");
		const _curve = curve || EasingFunctions.linear;
		const _duration = (duration || 1000);
		this.smoothingCamera = true;
		this.smoothingCameraFunction = () => {
			timer.tick();
			if (timer.ticks > _duration) {
        this.smoothingCamera = false;
        return;
      }
			const pos = lerp3(
        origin,
        position,
        _curve(timer.ticks / _duration)
      );
			this.camera.position.set(pos.x, pos.y, pos.z);
			target && this.camera.lookAt(target);
		};
	}
	update() {
		this.smoothingCamera && this.smoothingCameraFunction();
		this.messenger.postMessage("RENDERER_UPDATED");
	}
	render() {
		
		this.update();
		this.resizeCanvasToDisplaySize();
		requestAnimationFrame(this.render);
		
		this.renderer.render(this.scene, this.camera);
	}
	
	
	get background() {
		return (this.scene.background as THREE.Color).getHexString();
	}
	set background(color: string) {
		(this.scene.background as THREE.Color).setStyle(color);
	}
	get fogColor() {
		return (this.scene.fog && this.scene.fog.color && this.scene.fog.color.getHexString()) || "#000000";
	}
	set fogColor(color: string) {
		this.scene.fog?.color.setStyle(color);
	}
	
	
}


export interface SmoothCameraParams {
	position: THREE.Vector3;
	target?: THREE.Vector3;
	duration: number;
	curve?: (t: number) => number;
}

export class Ticker{
	ticks: number;
	kind: "inc" | "dec";
	inc: boolean;
	tick: (() => number);
	constructor(kind: "inc" | "dec", ticks?: number) {
		this.kind = kind;
		this.inc = this.kind === "inc";
		this.ticks = ticks || 0;	
		this.tick = this.inc
			? function () {
				return this.ticks++;
			}
			: function () {
				return this.ticks--;
			}
	}
}

