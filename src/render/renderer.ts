import * as THREE from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { OrbitControls } from "./OrbitControls";

//@ts-ignore
// import fs from "!raw-loader!./shaders/beam/shader.frag";
//@ts-ignore
// import vs from "!raw-loader!./shaders/beam/shader.vert";
// import { AudioRenderer } from './audio';
import { CameraStore } from "../common/storage-schemas";

import Timer from '../common/timer';

import { lerp, lerp3 } from "../common/lerp";
import EasingFunctions from '../common/easing';
import cubicBezier from '../common/cubic-bezier';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

//@ts-ignore
import speakerModel from "!raw-loader!../res/models/speaker.gltf";
//@ts-ignore
import micModel from "!raw-loader!../res/models/mic.gltf";

import whitematcap from '../res/textures/matcap-porcelain-white.jpg';
import triPattern from '../res/textures/tri_pattern.jpg'

import Container from "../objects/container";

import Grid from "./env/grid";
import { KeyValuePair } from "../common/key-value-pair";

import defaults from './defaults';
import Axes from './env/axes';
import Lights from './env/lights';
import Room from '../objects/room';
import Messenger from "../messenger";


import PickHelper from './pick-helper';



export interface SmoothCameraParams {
  /**
   * Where the camera will end up
   */
  position: THREE.Vector3;

  /**
   * Where to look at while moving
   */
  target?: THREE.Vector3;

  /**
   * time in ms
   */
  duration?: number;

  /**
   * easing function which acts similar to a css function
   */
	easingFunction?: (t: number) => number;
	
	/**
	 * callback
	 */
  onFinish?: (...args) => void;
}



export interface OrbitControlMouseConfig {		
	LEFT: number;
	MIDDLE: number;
	RIGHT: number;
}

export interface MouseConfigSet {
  Default: OrbitControlMouseConfig;
  Shift: OrbitControlMouseConfig;
  Control: OrbitControlMouseConfig;
  Alt: OrbitControlMouseConfig;
  Meta: OrbitControlMouseConfig;
}

export interface ModifierKeyState {
	Shift: number;
  Control: number;
  Alt: number;
  Meta: number;
}

export interface RendererParams{
	elt?: HTMLCanvasElement;
	messenger: Messenger;
}

export default class Renderer {
	
	mouseConfigSet!: MouseConfigSet;
	modifierKeyState!: ModifierKeyState; 
	
	elt!: HTMLCanvasElement;
	renderer!: THREE.Renderer;

	_camera!: THREE.PerspectiveCamera|THREE.OrthographicCamera;
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

	_fov!: number;

  textures!: KeyValuePair<THREE.Texture>
	smoothingCameraCallback!: any;
	smoothingCamera!: boolean;
	messenger: Messenger;
	pickHelper!: PickHelper;
	composer!: EffectComposer;
	outlinePass!: OutlinePass;
	renderPass!: RenderPass;
	effectFXAA!: ShaderPass;
	


	
	constructor(params: RendererParams) {
		[
			"init",
			"render",
			"smoothCameraTo",
			"setOrtho",
			"storeCameraState"
		].forEach(method => {
			this[method] = this[method].bind(this);
		});
		
		
		

		this.messenger = params.messenger;
		
	}
	
	init(elt: HTMLCanvasElement) {

		this.modifierKeyState = {
			Shift: 0,
			Control: 0,
			Alt: 0,
			Meta: 0
		};
		
		this.smoothingCamera = false;
		this.smoothingCameraCallback = undefined;
		this.elt = elt;
		this.stack = [] as Array<(...args) => void>;
		this.env = new Container("env");
		this.workspace = new Container("workspace");
		this.workspaceCursor = this.workspace;
		
		this.lights = new Lights();
		this.grid = new Grid();
		this.axes = new Axes();
		
		this.env.add(this.grid, this.lights, this.axes);
		

		const background = 0xf5f8fa;

		// scene
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(background);
		this.scene.add(this.env, this.workspace);
		
		// renderer
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
		
		
		this._fov = 45;
		const aspect = this.aspect;
		const near = 0.01;
		const far = 500;
		const up = [0, 0, 1];
			
		this._camera = new THREE.PerspectiveCamera(this._fov, aspect, near, far);
		this._camera.layers.enableAll();
		this._camera.up.set(up[0], up[1], up[2]);

		


		this.mouseConfigSet = {
			Default: {
				LEFT: THREE.MOUSE.ROTATE,
				MIDDLE: THREE.MOUSE.DOLLY,
				RIGHT: THREE.MOUSE.PAN
			},
			Shift: {
				LEFT: THREE.MOUSE.ROTATE,
				MIDDLE: THREE.MOUSE.DOLLY,
				RIGHT: THREE.MOUSE.PAN
			},
			Meta: {
				LEFT: THREE.MOUSE.ROTATE,
				MIDDLE: THREE.MOUSE.DOLLY,
				RIGHT: THREE.MOUSE.PAN
			},
			Alt: {
				LEFT: THREE.MOUSE.ROTATE,
				MIDDLE: THREE.MOUSE.DOLLY,
				RIGHT: THREE.MOUSE.PAN
			},
			Control: {
				LEFT: THREE.MOUSE.ROTATE,
				MIDDLE: THREE.MOUSE.DOLLY,
				RIGHT: THREE.MOUSE.PAN
			}
		};

		this.controls = new OrbitControls(this._camera, this.renderer.domElement);
		this.controls.mouseButtons = this.mouseConfigSet.Default;
		this.controls.screenSpacePanning = true;
		// console.log(this.controls)
		

	
		this.pickHelper = new PickHelper(this.scene, this._camera, this.renderer.domElement);
	
		this.fog = new THREE.Fog(background, far - 200, far);
		this.scene.fog = this.fog;

		this.composer = new EffectComposer(this.renderer as THREE.WebGLRenderer);

		this.renderPass = new RenderPass(this.scene, this._camera);
		this.composer.addPass(this.renderPass);

	
		this.settingHandlers = {};
		this.settingHandlers.lightHelpersVisible = (val: boolean) => {
			console.log(val);
			this.lights.setHelpersVisible(val);
		};

		this.messenger.addMessageHandler("RENDERER_SHOULD_CHANGE_BACKGROUND", (acc, ...args) => (this.background = args[0]));
		this.messenger.addMessageHandler("RENDERER_SHOULD_CHANGE_FOG_COLOR", (acc, ...args) => (this.fogColor = args[0]));
		this.messenger.addMessageHandler("TOGGLE_CAMERA_ORTHO", (acc, ...args) => {
			this.setOrtho(this.camera instanceof THREE.PerspectiveCamera);
			this.storeCameraState();
		});
		this.messenger.addMessageHandler("SHOULD_REMOVE_CONTAINER", (acc, ...args) => {
			const id = args[0];
			const object = this.scene.getObjectByProperty("uuid", id);
			if (object) {
				console.log(object);
				object.parent && object.parent.remove(object);
				// this.scene.remove(object);
			}
		});
		
		this.messenger.addMessageHandler("LOOK_ALONG_AXIS", (acc, ...args) => {
			const axis = args[0];

			const onFinish = () => {
        if (this.camera instanceof THREE.PerspectiveCamera) {
          this.messenger.postMessage("TOGGLE_CAMERA_ORTHO");
        }
			};
			const dist = this.camera.position.distanceTo(this.controls.target);
			
			const duration = 1000;
			const target = new THREE.Vector3(0,0,0);
			const easingFunction = EasingFunctions.linear;
			
			const adds = {
        "+x": new THREE.Vector3(dist, 0, 0),
        "-x": new THREE.Vector3(-dist, 0, 0),
        "+y": new THREE.Vector3(0, dist, 0),
        "-y": new THREE.Vector3(0, -dist, 0),
        "+z": new THREE.Vector3(0, 0, dist),
        "-z": new THREE.Vector3(0, 0, -dist)
			};
			if (!adds[axis]) {
				console.warn("invalid args");
      	return;
      }
			// const position = this.controls.target.clone() as THREE.Vector3;
			const position = adds[axis];
      this.smoothCameraTo({ position, target, duration, onFinish, easingFunction });
			
		})
	


		// save the state of the camera
		window.addEventListener("mouseup", this.storeCameraState);

		window.addEventListener("keydown", (e) => {
			if (this.modifierKeyState.hasOwnProperty(e.key)) {
				this.modifierKeyState[e.key] += 1;
			}
			if (e.key === "Escape") {
				this.messenger.postMessage("DESELECT_ALL_OBJECTS");
			}
		});

		window.addEventListener("keyup", (e) => {
			if (this.modifierKeyState.hasOwnProperty(e.key)) {
				this.modifierKeyState[e.key] -= 1;
			}
		});

		this.renderer.domElement.addEventListener("mousedown", (e) => {
			const selection = this.pickHelper.pick(e, [this.workspace]);

			if (selection) {
				if (e.button == 0) {
					if (e.shiftKey) {
						this.messenger.postMessage("APPEND_SELECTION", [selection]);
					} else if (!e.altKey) {
						this.messenger.postMessage("SET_SELECTION", [selection]);
					}
				} else {
				}
			} else {
				if (e.button == 0) {
					if (!e.shiftKey && !e.altKey) {
						this.messenger.postMessage("DESELECT_ALL_OBJECTS");
					}
				}
			}
			// console.log(this.pickHelper);
		});
		
		this.render();
		// this.composer.render();
		
		const storedState = JSON.parse(localStorage.getItem("camera") || defaults.camera) as CameraStore;
		
		if (storedState) {
			if (storedState.object) {
        this.camera.position.fromArray(storedState.object.pos);
        this.camera.quaternion.fromArray(storedState.object.quat);
				this.camera.near = storedState.object.near;
				this.camera.far = storedState.object.far;
				if (storedState.object.type === "PerspectiveCamera") {
					this.camera = new THREE.PerspectiveCamera((this.camera as THREE.PerspectiveCamera).fov, aspect, this.camera.near, this.camera.far);
					this.camera.zoom = storedState.object.zoom;
				}
				else if (storedState.object.type === "OrthographicCamera") {
					this.camera = new THREE.OrthographicCamera(storedState.object.left!, storedState.object.right!, storedState.object.top!, storedState.object.bottom!, this.camera.near, this.camera.far);
					this.camera.zoom = storedState.object.zoom;
				}
				this.controls.target.fromArray(storedState.object.target || [0, 0, 0]);
				// this.camera.layers.enableAll();
				// this.camera.up.set(0,0,1);
      }
    }

		// setInterval(this.render, 1000 / 20);

	}
	
	storeCameraState() {
		const obj = this.camera.toJSON();
    obj.object.quat = this.camera.quaternion.toArray();
		obj.object.pos = this.camera.position.toArray();
		obj.object.zoom = this.camera.zoom;
		obj.object.target = this.controls.target.toArray();
    localStorage.setItem("camera", JSON.stringify(obj));
	}
	
	resetControls() {
		this.controls.dispose();
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.mouseButtons = this.mouseConfigSet.Default;
    this.controls.screenSpacePanning = true;
    // console.log(this.controls)
	}
	
	setOrtho(on: boolean) {
		const near = this.camera.near;
		const far = this.camera.far;
		const fov = this.camera instanceof THREE.PerspectiveCamera && this.camera.fov || this.fov;
		const filmWidth = (this.camera instanceof THREE.PerspectiveCamera && this.camera.getFilmWidth()) || 35;
		const filmHeight = (this.camera instanceof THREE.PerspectiveCamera && this.camera.getFilmHeight()) || 35/this.aspect;
		const target = this.controls.target.toArray();
		if (on) {
			// const { left, right, top, bottom } = this.getCenteredCanvasBounds();
			// const top = far * Math.tan((Math.PI / 360) * this.aspect * fov);
			// const right = far * Math.tan((Math.PI / 360) * fov);
			
			const top = filmHeight / 2;
			const right = filmWidth / 2;
			const bottom = -top;
			const left = -right;
			let camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
			// camera.zoom = 8.1;
			this.camera = camera;
			this.camera.layers.enableAll();
		}
		else {
			this.camera = new THREE.PerspectiveCamera(fov, this.aspect, near, far);
			this.camera.layers.enableAll();
		}
		this.controls.target.fromArray(target);
		// this.resizeCanvasToDisplaySize(true);
		// this.camera.position.set(pos.x, pos.y, pos.z);
		// this.camera.applyQuaternion(quat);
		
	}
	
	get camera() {
		return this._camera;
	}
	
	set camera(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
		const quat = new THREE.Quaternion().copy(this._camera.quaternion);
		const pos = new THREE.Vector3().copy(this._camera.position);
		this._camera = camera;
		this._camera.up.set(0, 0, 1);
		// this.controls.dispose();
		// this.controls = new OrbitControls(this._camera, this.renderer.domElement);
  	// this.controls.mouseButtons = this.mouseConfigSet.Default;
		// this.controls.screenSpacePanning = true;
		this.controls.object = this._camera;
		this.controls.update();
		this._camera.position.set(pos.x, pos.y, pos.z);
		this._camera.setRotationFromQuaternion(quat)
		this._camera.quaternion.normalize();
		this._camera.updateProjectionMatrix();
		if (this.renderPass.camera.uuid !== this._camera.uuid) {
			this.renderPass.camera = this._camera;
		}
		
		this.pickHelper = new PickHelper(this.scene, this._camera, this.renderer.domElement);
	}
	
	get zoom() {
		return (this.camera && this.camera.zoom) || 1;
	}
	
	set zoom(zoom: number) {
		this._camera.zoom = zoom;
		this.camera.updateProjectionMatrix();
	}
	
	get isOrtho() {
		return this.camera instanceof THREE.OrthographicCamera;
	}
	
	set isOrtho(ortho: boolean) {
		if (ortho != this.isOrtho) {
			this.messenger.postMessage("TOGGLE_CAMERA_ORTHO");
		}
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
	get fov() {
		return this.camera instanceof THREE.PerspectiveCamera ? this.camera.fov : this._fov;
	}
	set fov(fov: number) {
		this._fov = fov;
		if (this.camera instanceof THREE.PerspectiveCamera) {
			this.camera.fov = fov;
		}
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
	
	
	resize() {
		this.renderer.setSize(
			this.renderer.domElement.parentElement?.clientWidth || 0,
			this.renderer.domElement.parentElement?.clientHeight || 0
		);
		this.composer.setSize(
			this.renderer.domElement.parentElement?.clientWidth || 0,
			this.renderer.domElement.parentElement?.clientHeight || 0
		);

	}
	resizeCanvasToDisplaySize(force?: boolean) {
		const canvas = this.renderer.domElement;
		// look up the size the canvas is being displayed
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
	
		// adjust displayBuffer size to match
		if (canvas.width !== width || canvas.height !== height || force) {
			// you must pass false here or three.js sadly fights the browser
			this.renderer.setSize(width, height, false);
			this.composer.setSize(width, height);
				if (this.camera instanceof THREE.OrthographicCamera) {
          this.camera.left = -canvas.width / 2;
          this.camera.right = canvas.width / 2;
          this.camera.top = canvas.height / 2;
          this.camera.bottom = -canvas.height / 2;
        } else {
          (this.camera as THREE.PerspectiveCamera).aspect = canvas.width / canvas.height;

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
	remove(obj: THREE.Object3D) {
		this.workspace.getObjectByProperty('uuid', obj.uuid)?.remove();
	}
	
	addRoom(room: Room) {
		this.workspaceCursor.add(room);
		const near =
			room.boundingBox.max
				.clone()
				.sub(room.boundingBox.min)
				.length() * 4;
		const far = near * 4;
		const color = this.fog.color;
		this.fog = new THREE.Fog(color.getHex(), near, far);
    this.scene.fog = this.fog;
	}

	
	

	
	getCenteredCanvasBounds() {
		const halfheight = this.renderer.domElement.height / 2;
		const halfwidth = this.renderer.domElement.width / 2;
		return {
			top: halfheight,
			bottom: -halfheight,
			left: -halfwidth,
			right: halfwidth
		}
	}
	getOrthoBounds() {
		if (this.camera instanceof THREE.OrthographicCamera) {
			return [this.camera.top, this.camera.bottom, this.camera.left, this.camera.right];
		}
		else {
			return [this.orthoCamera.top, this.orthoCamera.bottom, this.orthoCamera.left, this.orthoCamera.right];
		}
	}

	smoothCameraTo(params: SmoothCameraParams) {
		const originalPosition = this.camera.position.clone();
		const originalTarget = this.controls.target.clone();
		const target = params.target || originalTarget.clone();
		const timer = new Timer(params.duration || 1000, (_timer) => {
			this.smoothingCamera = false;
			console.log('finished');
			if (params.onFinish) {
				params.onFinish(_timer);
			}
		});
		const curveFunction = params.easingFunction || EasingFunctions.linear;
		this.smoothingCamera = true;
		this.smoothingCameraCallback = () => {
			const progress = curveFunction(timer.tick());
			const pos = lerp3(originalPosition, params.position, curveFunction(progress));
			const tar = lerp3(originalTarget, target, curveFunction(progress));
			this.camera.position.set(pos.x, pos.y, pos.z);
			this.camera.lookAt(tar);
			this.controls.target.set(tar.x, tar.y, tar.z);
		};
		timer.start();
	}
	update() {
		this.smoothingCamera && this.smoothingCameraCallback();
		this.messenger.postMessage("RENDERER_UPDATED");
	}
	render() {
		
		this.update();
		this.resizeCanvasToDisplaySize();
		requestAnimationFrame(this.render);
		// this.renderer.render(this.scene, this.camera);
		this.composer.render();
	}
	
	
	
	
	
}
