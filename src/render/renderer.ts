import * as THREE from "three";
import Stats from "./Stats";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { OrbitControls } from "./OrbitControls";
import { TransformControls } from "./TransformControls";
import { quat2angle, angle2quat, QuatAngle } from "../common/QuatAngle";
import { CameraStore } from "../common/storage-schemas";

import Timer from "../common/timer";

import { lerp3 } from "../common/lerp";
import EasingFunctions from "../common/easing";

import Container from "../objects/container";

import Grid from "./env/grid";
import { KeyValuePair } from "../common/key-value-pair";

import defaults from "../default-storage";
import Axes from "./env/axes";
import Lights from "./env/lights";
import Room from "../objects/room";
import Messenger, { emit, messenger, on } from "../messenger";

import { addMoment, Directions } from "../history";

import PickHelper from "./pick-helper";

import { TransformOverlay, GlobalOverlay } from "./overlays";
import hotkeys from "hotkeys-js";

import {
  OrientationControl,
  OrientationAxisAdds,
  OrientationAxisQuats,
  OrientationControlOptions
} from "./orientation-control/orientation-control";

import Cursor from "./Cursor";
import { Processes } from "../constants/processes";

import { Markup } from "./Markup";
import Model from "../objects/model";
import { useContainer } from "../store";
import { useSetting } from "../store/settings-store";



const colored_number_html = (num: number) =>
  /*html*/ `<span style="color: ${num < 0 ? "#E68380" : "#A2C982"};">${num.toFixed(3)}</span>`;

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

export interface SmoothCameraQuatParams extends SmoothCameraParams {
  /**
   * final orientation
   */
  quat: THREE.Quaternion;
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



export interface Overlays {
  transform: TransformOverlay;
  global: GlobalOverlay;
}

export default class Renderer {
  stats!: Stats;

  mouseConfigSet!: MouseConfigSet;
  modifierKeyState!: ModifierKeyState;

  elt!: HTMLCanvasElement;
  renderer!: THREE.WebGLRenderer;

  _camera!: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  perspectiveCamera!: THREE.PerspectiveCamera;
  orthoCamera!: THREE.OrthographicCamera;

  scene!: THREE.Scene;
  env!: Container;
  fdtdItems!: Container;
  interactables!: Container;
  workspace!: Container;
  sketches!: Container;
  markup!: Markup;

  lights!: Lights;
  axes!: Axes;
  grid!: Grid;

  stack!: Array<(...args) => void>;

  settingHandlers!: KeyValuePair<(val: any) => void>;

  sourceGroup!: Container;
  sourceTemplate!: Container;

  receiverGroup!: Container;
  receiverTemplate!: Container;

  geometryGroup!: Container;
  controls;

  workspaceCursor!: THREE.Object3D;
  fog!: THREE.FogExp2 | THREE.Fog;

  _fov!: number;

  textures!: KeyValuePair<THREE.Texture>;
  smoothingCameraCallback!: any;
  smoothingCamera!: boolean;

  pickHelper!: PickHelper;
  cursor!: Cursor;
  composer!: EffectComposer;
  outlinePass!: OutlinePass;
  renderPass!: RenderPass;
  effectFXAA!: ShaderPass;

  transformControls!: TransformControls;
  currentlyMovingObjects!: boolean;

  overlays!: Overlays;
  fdtd2drunning!: boolean;
  fdtd3drunning!: boolean;


  needsToRender!: boolean;

  shouldAnimate: boolean;

  orientationControl!: OrientationControl;

  currentProcess!: Processes;

  constructor() {
    ["init", "render", "smoothCameraTo", "setOrtho", "storeCameraState", "onOrbitControlsChange"].forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.shouldAnimate = false;
    this.currentProcess = Processes.NONE;
  }

  init(elt: HTMLCanvasElement) {

    const editorSettings = useSetting.getState().settings.editor;

    this.fdtd2drunning = false;
    this.fdtd3drunning = false;

    this.modifierKeyState = {
      Shift: 0,
      Control: 0,
      Alt: 0,
      Meta: 0
    };

    this.overlays = {
      transform: new TransformOverlay("#canvas_overlay"),
      global: new GlobalOverlay(elt.parentElement!)
    };

    this.smoothingCamera = false;
    this.smoothingCameraCallback = undefined;
    this.elt = elt;
    this.stack = [] as Array<(...args) => void>;
    this.env = new Container("env");
    this.fdtdItems = new Container("fdtdItems");
    this.workspace = new Container("workspace");
    this.workspace.userData.isWorkspace = true;
    this.interactables = new Container("interactables");
    this.sketches = new Container("sketches");
    this.markup = new Markup();

    this.workspaceCursor = this.workspace;

    this.lights = new Lights();
    this.grid = new Grid("grid", {
      size: 500,
      cellSize: 1,
      majorLinesEvery: 10,
      color1: 0xd4d6d8,
      color2: 0xe4e7e8
    });
    this.axes = new Axes();

    this.env.add(this.grid, this.lights, this.axes);

    this.cursor = new Cursor();
    this.env.add(this.cursor);

    const background = 0xf5f8fa;

    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(background);
    this.scene.add(
      this.env,
      this.workspace,
      this.interactables,
      this.fdtdItems,
      this.sketches,
      this.markup
    );

    // renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.elt,
      context: this.elt.getContext("webgl2", { alpha: true })!,
      antialias: true,
      depth: true
    });

    this.renderer.setSize(this.clientWidth, this.clientHeight);
    const pixelRatio = window.devicePixelRatio;
    //@ts-ignore
    this.renderer.setPixelRatio(pixelRatio);

    // this.renderer.gammaFactor = 2.2;
    // this.renderer.gammaOutput = true;

    this._fov = 45;
    const aspect = this.aspect;
    const near = 0.01;
    const far = 500;
    const up = [0, 0, 1];

    this._camera = new THREE.PerspectiveCamera(this._fov, aspect, near, far);
    this._camera.layers.enableAll();
    this._camera.position.set(1, 1, 1);
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

    this.transformControls = new TransformControls(this._camera, this.renderer.domElement);
    //@ts-ignore
    this.transformControls.addEventListener("mouseUp", (e) => {
      if (!e.target.object || !(e.target.object instanceof Container)) {
        return;
      } else {
        const objects = e.target.allAssociatedObjects;
        const undoSaves = new Map<string, any>();
        const redoSaves = new Map<string, any>();
        for (let i = 0; i < objects.length; i++) {
          undoSaves.set(objects[i].uuid, Object.assign({}, objects[i].userData.lastSave));
          redoSaves.set(objects[i].uuid, Object.assign({}, objects[i].save()));
        }
        addMoment({
          category: "OBJECT_TRANSFORM",
          objectId: e.target.object.uuid,
          recallFunction: (direction: keyof Directions) => {
            if (direction === "UNDO") {
              for (let i = 0; i < objects.length; i++) {
                objects[i].restore(undoSaves.get(objects[i].uuid));
              }
            } else if (direction === "REDO") {
              for (let i = 0; i < objects.length; i++) {
                objects[i].restore(redoSaves.get(objects[i].uuid));
              }
            }
          }
        });
      }
    });
    //@ts-ignore
    this.transformControls.addEventListener("mouseDown", (e) => {
      const objects = e.target.allAssociatedObjects;
      for (let i = 0; i < objects.length; i++) {
        objects[i].userData.lastSave = objects[i].save();
      }
    });
    // this.transformControls.setSize(0.5);
    //@ts-ignore
    this.transformControls.addEventListener("change", (e) => {
      const target = e.target as TransformControls;
      const objects = target.allAssociatedObjects;
      if (typeof objects !== "undefined") {
        const pos = objects[0] && objects[0].position;
        const lastSave = objects[0] && objects[0].userData.lastSave;
        const lastPos = lastSave && new THREE.Vector3().fromArray(lastSave.position);
        if (pos && lastPos) {
          const diff = new THREE.Vector3().copy(pos).sub(lastPos);
          for (let i = 0; i < objects.length; i++) {
            objects[i].position.set(
              objects[i].userData.lastSave.position[0] + diff.x,
              objects[i].userData.lastSave.position[1] + diff.y,
              objects[i].userData.lastSave.position[2] + diff.z
            );
          }
          this.overlays.transform.setValues(diff.x, diff.y, diff.z);
        }
      }
      // console.log((e.target as TransformControls).getWorldPosition(new THREE.Vector3()))
    });

    this.currentlyMovingObjects = false;

    this.pickHelper = new PickHelper(this.scene, this._camera, this.renderer.domElement);

    this.fog = new THREE.FogExp2(background, 0.015);
    this.scene.fog = this.fog;

    this.composer = new EffectComposer(this.renderer as THREE.WebGLRenderer);

    this.renderPass = new RenderPass(this.scene, this._camera);
    this.composer.addPass(this.renderPass);

    this.settingHandlers = {};
    this.settingHandlers.lightHelpersVisible = (val: boolean) => {
      console.log(val);
      this.lights.setHelpersVisible(val);
    };

    messenger.addMessageHandler("SET_RENDERER_SHOULD_ANIMATE", (acc, ...args) => {
      this.shouldAnimate = args[0];
    });

    messenger.addMessageHandler("RENDERER_SHOULD_CHANGE_BACKGROUND", (acc, ...args) => {
      this.background = args[0];
      this.needsToRender = true;
    });
    messenger.addMessageHandler("RENDERER_SHOULD_CHANGE_FOG_COLOR", (acc, ...args) => {
      this.fogColor = args[0];
      this.needsToRender = true;
    });
    
    messenger.addMessageHandler("SHOULD_REMOVE_CONTAINER", (acc, ...args) => {
      const id = args[0];
      const object = this.scene.getObjectByProperty("uuid", id);
      if (object) {
        // console.log(object);
        object.parent && object.parent.remove(object);
        // this.scene.remove(object);
      }
      this.needsToRender = true;
    });



    messenger.addMessageHandler("LOOK_ALONG_AXIS", (acc, ...args) => {
      const axis = args[0];
      if (!OrientationAxisAdds[axis]) {
        console.warn("invalid args");
        return;
      }
      const dist = this.camera.position.distanceTo(this.controls.target);

      const duration = 125;
      const target = this.controls.target.clone();
      const easingFunction = EasingFunctions.linear;
      const onFinish = () => {
        // this.resetControls();
        this.controls.target.set(target.x, target.y, target.z);
        this.orientationControl.axis = axis;
        this.storeCameraState();
        this.needsToRender = true;
      };

      // const position = this.controls.target.clone() as THREE.Vector3;
      const position = this.controls.target.clone().add(OrientationAxisAdds[axis].clone().multiplyScalar(dist));
      const quat = OrientationAxisQuats[axis].clone();
      this.smoothCameraToQuat({ position, target, duration, onFinish, easingFunction, quat });
      this.needsToRender = true;
    });





  

    messenger.addMessageHandler("TOGGLE_RENDERER_STATS_VISIBLE", () => {
      if (this.stats.hidden) {
        this.stats.unhide();
      } else {
        this.stats.hide();
      }
    });

    messenger.addMessageHandler("GET_RENDERER_STATS_VISIBLE", () => !this.stats.hidden);

    // save the state of the camera
    window.addEventListener("mouseup", (e) => {
      this.storeCameraState();
      this.needsToRender = true;
    });

    window.addEventListener("keydown", (e) => {
      if (this.modifierKeyState.hasOwnProperty(e.key)) {
        this.modifierKeyState[e.key] += 1;
      }
    });

    window.addEventListener("keyup", (e) => {
      if (this.modifierKeyState.hasOwnProperty(e.key)) {
        this.modifierKeyState[e.key] -= 1;
      }
    });

    this.renderer.domElement.addEventListener("mousemove", (e) => {
      this.needsToRender = true;
    });

    this.renderer.domElement.addEventListener("wheel", (e) => {
      this.needsToRender = true;
      hotkeys.setScope("EDITOR");
    });

    this.renderer.domElement.addEventListener("mousedown", (e) => {
      hotkeys.setScope("EDITOR");
      const selection = this.pickHelper.pick(e, [this.workspace, this.interactables]);

      if (selection.pickedObject) {
        if (e.button == 0) {
          const point = this.pickHelper.getPickedPoint();
          this.cursor.position.set(point[0], point[1], point[2]);
          if (!this.currentlyMovingObjects) {
            if (e.shiftKey) {
              emit("APPEND_SELECTION", [selection.pickedObject]);
            } else if (!e.altKey) {
              emit("SET_SELECTION", [selection.pickedObject]);
            }
          }
        }
      } else {
        if (e.button == 0) {
          if (!e.shiftKey && !e.altKey) {
            emit("PHASE_OUT");
          }
        }
      }
      // console.log(this.pickHelper);
      this.needsToRender = true;
    });

    this.controls.addEventListener("change", this.onOrbitControlsChange);

    // this.composer.render();
    let storedState = JSON.parse(defaults.camera) as CameraStore;
    const camerastorage = localStorage.getItem("camera");
    if (camerastorage) {
      storedState = JSON.parse(camerastorage);
    }
    if (storedState) {
      if (storedState.object) {
        storedState.object.pos && this.camera.position.fromArray(storedState.object.pos);
        storedState.object.quat && this.camera.quaternion.fromArray(storedState.object.quat);
        this.camera.near = storedState.object.near;
        this.camera.far = storedState.object.far;
        if (storedState.object.type === "PerspectiveCamera") {
          this.camera = new THREE.PerspectiveCamera(
            (this.camera as THREE.PerspectiveCamera).fov,
            aspect,
            this.camera.near,
            this.camera.far
          );
          this.camera.zoom = storedState.object.zoom;
        } else if (storedState.object.type === "OrthographicCamera") {
          this.camera = new THREE.OrthographicCamera(
            storedState.object.left!,
            storedState.object.right!,
            storedState.object.top!,
            storedState.object.bottom!,
            this.camera.near,
            this.camera.far
          );
          this.camera.zoom = storedState.object.zoom;
        }
        this.controls.target.fromArray(storedState.object.target || [0, 0, 0]);
        // this.camera.layers.enableAll();
        // this.camera.up.set(0,0,1);
      }
    }

    const storedOrientation = JSON.parse(
      localStorage.getItem("orientationControl") || defaults.orientationControl
    ) as OrientationControlOptions;

    this.orientationControl = new OrientationControl("#orientation-overlay", {
      // width: storedOrientation.width,
      // height: storedOrientation.height,
      width: 160,
      height: 160,
      axis: storedOrientation.axis
    });

    this.orientationControl.addClickListener((e) => {
      if (e.target.match(/top|bottom|right|left|front|back/gim)) {
        messenger.postMessage("LOOK_ALONG_AXIS", e.target);
      }
    });

    const pos = this.camera.position
      .clone()
      .sub(this.controls.target)
      .normalize()
      .multiplyScalar(this.orientationControl.cameraDistance);

    this.orientationControl.setCameraTransforms(pos, this.camera.quaternion);

    this.stats = new Stats();
    this.overlays.global.addCell("FPS", this.stats.fpsPanelValue, {
      id: "fps",
      hidden: false,
      formatter: (value: number) => String(Math.round(value)) + " Hz"
    });
    if (this.stats.memPanel) {
      this.overlays.global.addCell("Heap", this.stats.memPanelValue!, {
        id: "heap",
        hidden: false,
        formatter: (value: number) => String(Math.round(value)) + " MB"
      });
    }
    this.elt.parentElement?.appendChild(this.stats.container);
    this.stats.hide();
    this.render();

    setTimeout(() => {
      this.needsToRender = true;
    }, 100);
  }

  onOrbitControlsChange(e) {
    if (this.orientationControl) {
      const pos = this.camera.position
        .clone()
        .sub(this.controls.target)
        .normalize()
        .multiplyScalar(this.orientationControl.cameraDistance);
      this.orientationControl.setCameraTransforms(pos, this.camera.quaternion);
      this.orientationControl.axis = "none";
    }
  }

  storeCameraState() {
    const obj = this.camera.toJSON();
    obj.object.quat = this.camera.quaternion.toArray();
    obj.object.pos = this.camera.position.toArray();
    obj.object.zoom = this.camera.zoom;
    obj.object.target = this.controls.target.toArray();

    const orientState = this.orientationControl.save();
    localStorage.setItem("camera", JSON.stringify(obj));
    localStorage.setItem("orientationControl", JSON.stringify(orientState));
  }

  resetControls() {
    const target = this.controls.target.clone();
    this.controls.dispose();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(target.x, target.y, target.z);
    this.controls.mouseButtons = this.mouseConfigSet.Default;
    this.controls.screenSpacePanning = true;
    this.controls.update();
    this.controls.addEventListener("change", this.onOrbitControlsChange);
    this.needsToRender = true;
    // console.log(this.controls)
  }

  setOrtho(on: boolean) {
    const axis = this.orientationControl.axis;
    const near = this.camera.near;
    const far = this.camera.far;
    const fov = (this.camera instanceof THREE.PerspectiveCamera && this.camera.fov) || this.fov;
    const filmWidth = (this.camera instanceof THREE.PerspectiveCamera && this.camera.getFilmWidth()) || 35;
    const filmHeight =
      (this.camera instanceof THREE.PerspectiveCamera && this.camera.getFilmHeight()) || 35 / this.aspect;
    const target = this.controls.target.toArray();
    if (on) {
      // const { left, right, top, bottom } = this.getCenteredCanvasBounds();
      // const top = far * Math.tan((Math.PI / 360) * this.aspect * fov);
      // const right = far * Math.tan((Math.PI / 360) * fov);

      const top = filmHeight / 2;
      const bottom = -top;
      const right = filmWidth / 2;
      const left = -right;
      let camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
      // camera.zoom = 8.1;
      this.camera = camera;
      this.camera.layers.enableAll();
    } else {
      this.camera = new THREE.PerspectiveCamera(fov, this.aspect, near, far);
      this.camera.layers.enableAll();
    }
    this.controls.target.fromArray(target);

    const pos = this.camera.position
      .clone()
      .sub(this.controls.target)
      .normalize()
      .multiplyScalar(this.orientationControl.cameraDistance);
    this.orientationControl.setCameraTransforms(pos, this.camera.quaternion);
    this.orientationControl.axis = axis;

    this.updateCursorSize();

    // this.resizeCanvasToDisplaySize(true);
    // this.camera.position.set(pos.x, pos.y, pos.z);
    // this.camera.applyQuaternion(quat);
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
      // this.needsToRender = true;
      // update any render target sizes here
    }
  }
  checkresize() {
    if (
      this.renderer.domElement.width !== this.renderer.domElement.parentElement?.clientWidth ||
      0 ||
      this.renderer.domElement.height !== (this.renderer.domElement.parentElement?.clientHeight || 0)
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
    this.needsToRender = true;
  }
  remove(obj: THREE.Object3D) {
    this.workspaceCursor.remove(obj);
    // this.workspace.getObjectByProperty("uuid", obj.uuid)?.remove();
    this.needsToRender = true;
  }
  addModel(model: Model) {
    this.workspaceCursor.add(model);
    this.needsToRender = true;
  }
  addRoom(room: Room) {
    this.workspaceCursor.add(room);
    this.needsToRender = true;
  }

  getCenteredCanvasBounds() {
    const halfheight = this.renderer.domElement.height / 2;
    const halfwidth = this.renderer.domElement.width / 2;
    return {
      top: halfheight,
      bottom: -halfheight,
      left: -halfwidth,
      right: halfwidth
    };
  }
  getOrthoBounds() {
    if (this.camera instanceof THREE.OrthographicCamera) {
      return [this.camera.top, this.camera.bottom, this.camera.left, this.camera.right];
    } else {
      return [this.orthoCamera.top, this.orthoCamera.bottom, this.orthoCamera.left, this.orthoCamera.right];
    }
  }

  quat2angle(quat: THREE.Quaternion) {
    return quat2angle(quat);
  }

  angle2quat(angle: QuatAngle) {
    return angle2quat(angle);
  }

  applyQuatAngle(angle: number, x: number, y: number, z: number) {
    const vec = new THREE.Vector3(x, y, z);
    vec.normalize();
    const quat = new QuatAngle(angle, vec).toQuaternion();
    this.camera.applyQuaternion(quat);
    this.camera.updateProjectionMatrix();
    this.needsToRender = true;
  }

  roll(angle: number) {
    const quat = new QuatAngle(angle, new THREE.Vector3(0, 0, 1)).toQuaternion();
    this.camera.applyQuaternion(quat);
    this.camera.updateProjectionMatrix();
    this.needsToRender = true;
  }

  smoothCameraTo(params: SmoothCameraParams) {
    const originalPosition = this.camera.position.clone();
    const originalTarget = this.controls.target.clone();
    const target = params.target || originalTarget.clone();
    const timer = new Timer(params.duration || 1000, () => {});
    const curveFunction = params.easingFunction || EasingFunctions.linear;
    this.smoothingCamera = true;
    this.smoothingCameraCallback = () => {
      const timerProgress = timer.tick();
      const progress = curveFunction(timerProgress);
      const pos = lerp3(originalPosition, params.position, progress);
      const tar = lerp3(originalTarget, target, progress);
      this.camera.position.set(pos.x, pos.y, pos.z);
      this.camera.lookAt(tar);
      this.controls.target.set(tar.x, tar.y, tar.z);

      const orientationCameraPos = this.camera.position
        .clone()
        .sub(tar)
        .normalize()
        .multiplyScalar(this.orientationControl.cameraDistance);
      this.orientationControl.setCameraTransforms(orientationCameraPos, this.camera.quaternion);

      if (timerProgress == 1) {
        this.smoothingCamera = false;
        params.onFinish && params.onFinish(timer);
        this.storeCameraState();
      }
    };
    timer.start();
  }

  smoothCameraToQuat(params: SmoothCameraQuatParams) {
    const originalPosition = this.camera.position.clone();
    const originalTarget = this.controls.target.clone();
    const originalDistance = originalTarget.distanceTo(originalPosition);
    const originalQuat = this.camera.quaternion.clone();
    const targetQuat = params.quat || originalQuat.clone();
    const timer = new Timer(params.duration || 1000, (_timer) => {});
    const curveFunction = params.easingFunction || EasingFunctions.linear;
    this.smoothingCamera = true;
    this.smoothingCameraCallback = () => {
      const timerProgress = timer.tick();
      const progress = curveFunction(timerProgress);
      const pos = lerp3(originalPosition, params.position, progress);
      const quat = new THREE.Quaternion();
      quat.copy(originalQuat);
      const quatslerped = quat.slerp(targetQuat, progress);
      this.camera.position.set(pos.x, pos.y, pos.z);
      this.camera.quaternion.copy(quatslerped);
      // this.camera.updateProjectionMatrix();
      // get the cameras direction vector
      const dir = new THREE.Vector3();
      this.camera.getWorldDirection(dir);

      // scale it by distance from camera position to target position
      const scaledDir = dir.multiplyScalar(originalDistance);

      const tar = this.camera.position.clone().add(scaledDir);

      const orientationCameraPos = this.camera.position
        .clone()
        .sub(tar)
        .normalize()
        .multiplyScalar(this.orientationControl.cameraDistance);
      this.orientationControl.setCameraTransforms(orientationCameraPos, this.camera.quaternion);

      if (timerProgress == 1) {
        this.smoothingCamera = false;
        params.onFinish && params.onFinish(timer);
        this.storeCameraState();
      }
    };
    timer.start();
  }

  addShape() {
    var triangleShape = new THREE.Shape().moveTo(80, 20).lineTo(40, 80).lineTo(120, 80).lineTo(80, 20); // close path
  }



  update() {
    if (this.smoothingCamera) {
      this.needsToRender = true;
      this.smoothingCameraCallback();
    } else if (this.fdtd2drunning || this.fdtd3drunning) {
      this.needsToRender = true;
    }

    this.stats.update();
    this.overlays.global.setCellValue("fps", this.stats.fpsPanelValue);
    if (this.stats.memPanel) {
      this.overlays.global.setCellValue("heap", this.stats.memPanelValue!);
    }
  }
  updateCursorSize() {
    if (this.camera instanceof THREE.OrthographicCamera) {
      this.cursor.sprite.scale.setScalar(1 / this.camera.zoom);
    } else {
      this.cursor.sprite.scale.setScalar(0.035);
    }
  }
  render() {
    this.update();
    this.resizeCanvasToDisplaySize();

    if (this.needsToRender || this.shouldAnimate || this.orientationControl.shouldRender) {
      this.composer.render();

      this.updateCursorSize();

      this.orientationControl.shouldRender = true;

      messenger.postMessage("RENDERER_UPDATED");
      emit("RENDERER_UPDATED", undefined);
      this.needsToRender = false;
    }
    if (this.orientationControl.shouldRender) {
      this.orientationControl.render();
    }
    requestAnimationFrame(this.render);
  }

  /**
   * returns true if performing an operation, like moving an object.
   * put this here so that if user presses escape while moving/operating it doesnt deselect
   */
  get isPerformingOperation() {
    return this.currentlyMovingObjects;
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
    this.transformControls.camera = this._camera;
    this._camera.position.set(pos.x, pos.y, pos.z);
    this._camera.setRotationFromQuaternion(quat);
    this._camera.quaternion.normalize();
    this._camera.updateProjectionMatrix();
    if (this.renderPass.camera.uuid !== this._camera.uuid) {
      this.renderPass.camera = this._camera;
    }

    this.pickHelper = new PickHelper(this.scene, this._camera, this.renderer.domElement);
    this.needsToRender = true;
  }

  get fogDensity() {
    return (this.scene && this.scene.fog && (this.scene.fog as THREE.FogExp2).density) || 0.015;
  }

  set fogDensity(density: number) {
    (this.scene.fog as THREE.FogExp2).density = density;
  }

  get gridVisible() {
    return this.grid ? this.grid.visible : true;
  }

  set gridVisible(visible: boolean) {
    this.grid.visible = visible;
    this.needsToRender = true;
  }
  get cursorVisible() {
    return this.cursor ? this.cursor.visible : true;
  }

  set cursorVisible(visible: boolean) {
    this.cursor.visible = visible;
    this.needsToRender = true;
  }

  get axisVisible() {
    return this.axes ? this.axes.visible : true;
  }

  set axisVisible(visible: boolean) {
    this.axes.visible = visible;
    this.needsToRender = true;
  }

  get zoom() {
    return (this.camera && this.camera.zoom) || 1;
  }

  set zoom(zoom: number) {
    this.camera.zoom = zoom;
    this.camera.updateProjectionMatrix();
    this.needsToRender = true;
  }
  get near() {
    return (this.camera && this.camera.near) || 0.01;
  }

  set near(near: number) {
    this.camera.near = near;
    this.camera.updateProjectionMatrix();
    this.needsToRender = true;
  }
  get far() {
    return (this.camera && this.camera.far) || 500;
  }

  set far(far: number) {
    this.camera.far = far;
    this.camera.updateProjectionMatrix();
    this.needsToRender = true;
  }

  get isOrtho() {
    return this.camera instanceof THREE.OrthographicCamera;
  }

  set isOrtho(ortho: boolean) {
    if (ortho != this.isOrtho) {
      this.setOrtho(this.camera instanceof THREE.PerspectiveCamera);
      this.needsToRender = true;
      this.storeCameraState();
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
    this.needsToRender = true;
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
  private get mode() {
    return messenger.postMessage("GET_EDITOR_MODE")[0];
  }
}

export const renderer = new Renderer();

declare global {
  interface EventTypes {
    RENDERER_UPDATED: any;
    RENDERER_SHOULD_ANIMATE: boolean;
    PHASE_OUT: undefined;
    STOP_OPERATIONS: undefined;
    MOVE_SELECTED_OBJECTS: undefined;
    TOGGLE_CAMERA_ORTHO: undefined;
    FOCUS_ON_SELECTED_OBJECTS: undefined;
    FOCUS_ON_CURSOR: undefined;
    RENDER: undefined;
  }
}

on("RENDER", () => {
  renderer.needsToRender = true;
});

on("RENDERER_SHOULD_ANIMATE", shouldAnimate => {
  renderer.shouldAnimate = shouldAnimate;
});

on("PHASE_OUT", () => {
  if (renderer.isPerformingOperation) {
    emit("STOP_OPERATIONS");
    // hotkeys.setScope("EDITOR");
  } else {
    emit("DESELECT_ALL_OBJECTS");
    // hotkeys.setScope("NORMAL");
  }
  renderer.needsToRender = true;
});

on("STOP_OPERATIONS", () => {
  //@ts-ignore
  renderer.interactables.remove(renderer.transformControls);
  renderer.transformControls.detach();
  renderer.currentlyMovingObjects = false;
  renderer.overlays.transform.hide();
  renderer.needsToRender = true;
});

on("MOVE_SELECTED_OBJECTS", () => {
  const selectedObjects = useContainer.getState().selectedObjects
  if (selectedObjects && selectedObjects.size > 0) {
    selectedObjects.forEach(container => container.userData.lastSave = container.save());
    hotkeys.setScope("EDITOR_MOVING");
    renderer.overlays.transform.setValues(0, 0, 0);
    renderer.transformControls.setTranslationSnap(0.01);
    renderer.overlays.transform.show();
    renderer.currentlyMovingObjects = true;
    renderer.transformControls.attach([...selectedObjects]);
    //@ts-ignore
    renderer.interactables.add(renderer.transformControls);
  }
  renderer.needsToRender = true;
});


on("TOGGLE_CAMERA_ORTHO", () => { renderer.isOrtho = !renderer.isOrtho; });

on("FOCUS_ON_SELECTED_OBJECTS", () => {
  const selectedObjects = [...useContainer.getState().selectedObjects];
  if (selectedObjects && selectedObjects.length > 0) {
    const easingFunction = EasingFunctions.linear;
    const position = renderer.camera.position;
    const target = selectedObjects[0].position;
    const duration = 125;
    const onFinish = () => {
      renderer.controls.target.set(target.x, target.y, target.z);
    };
    renderer.smoothCameraTo({ position, target, duration, onFinish, easingFunction });
  } else {
    const easingFunction = EasingFunctions.linear;
    const position = renderer.camera.position;
    const target = new THREE.Vector3(0, 0, 0);
    const duration = 125;
    const onFinish = () => {
      renderer.controls.target.set(target.x, target.y, target.z);
    };
    renderer.smoothCameraTo({ position, target, duration, onFinish, easingFunction });
  }
  renderer.needsToRender = true;
});

on("FOCUS_ON_CURSOR", () => {
  const easingFunction = EasingFunctions.linear;
  const position = renderer.camera.position;
  const target = renderer.cursor.position;
  const duration = 125;
  const onFinish = () => {
    renderer.controls.target.set(target.x, target.y, target.z);
  };
  renderer.smoothCameraTo({ position, target, duration, onFinish, easingFunction });
  renderer.needsToRender = true;
});

