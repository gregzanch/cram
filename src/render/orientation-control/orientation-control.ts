import * as THREE from 'three';
import PickHelper from "../pick-helper";
import fontjson from "three/examples/fonts/helvetiker_regular.typeface.json";
import Container from '../../objects/container';
import { uuid } from 'uuidv4';
import {helperArrow, helperArrowRotateRight, helperArrowRotateLeft} from './helper-arrows';

import "./orientation-control.css";
import rotateLeft from './svg-icons/rotate-left.svg';
import rotateRight from './svg-icons/rotate-right.svg';



export enum OrientationControlTargets {
  TOP = "top",
  BOTTOM = "bottom",
  LEFT = "left",
  RIGHT = "right",
  FRONT = "front",
  BACK = "back",
  
  TOP_FROM_FRONT = "top-from-front",
  TOP_FROM_RIGHT = "top-from-right",
  TOP_FROM_BACK = "top-from-back",
  TOP_FROM_LEFT = "top-from-left",

  BOTTOM_FROM_FRONT = "bottom-from-front",
  BOTTOM_FROM_RIGHT = "bottom-from-right",
  BOTTOM_FROM_BACK = "bottom-from-back",
  BOTTOM_FROM_LEFT = "bottom-from-left"
}

export const OrientationAxisAdds = {
  [OrientationControlTargets.RIGHT]: new THREE.Vector3(1, 0, 0),
  [OrientationControlTargets.LEFT]: new THREE.Vector3(-1, 0, 0),
  [OrientationControlTargets.BACK]: new THREE.Vector3(0, 1, 0),
  [OrientationControlTargets.FRONT]: new THREE.Vector3(0, -1, 0),
  [OrientationControlTargets.TOP]: new THREE.Vector3(0, 0, 1),
  [OrientationControlTargets.BOTTOM]: new THREE.Vector3(0, 0, -1),
  [OrientationControlTargets.TOP_FROM_FRONT]: new THREE.Vector3(0, 0, 1),
  [OrientationControlTargets.TOP_FROM_RIGHT]: new THREE.Vector3(0, 0, 1),
  [OrientationControlTargets.TOP_FROM_BACK]: new THREE.Vector3(0, 0, 1),
  [OrientationControlTargets.TOP_FROM_LEFT]: new THREE.Vector3(0, 0, 1),

  [OrientationControlTargets.BOTTOM_FROM_FRONT]: new THREE.Vector3(0, 0, -1),
  [OrientationControlTargets.BOTTOM_FROM_RIGHT]: new THREE.Vector3(0, 0, -1),
  [OrientationControlTargets.BOTTOM_FROM_BACK]: new THREE.Vector3(0, 0, -1),
  [OrientationControlTargets.BOTTOM_FROM_LEFT]: new THREE.Vector3(0, 0, -1)
};
export const OrientationAxisQuats = {
  [OrientationControlTargets.RIGHT]: new THREE.Quaternion(0.5, 0.5, 0.5, 0.5),
  [OrientationControlTargets.LEFT]: new THREE.Quaternion(-0.5, 0.5, 0.5, -0.5),
  [OrientationControlTargets.BACK]: new THREE.Quaternion(0, Math.sqrt(2) / 2, Math.sqrt(2) / 2, 0),
  [OrientationControlTargets.FRONT]: new THREE.Quaternion(Math.sqrt(2) / 2, 0, 0, Math.sqrt(2) / 2),
  [OrientationControlTargets.TOP]: new THREE.Quaternion(0, 0, 0, 1),
  [OrientationControlTargets.BOTTOM]: new THREE.Quaternion(1, 0, 0, 0),

  [OrientationControlTargets.TOP_FROM_FRONT]: new THREE.Quaternion(0, 0, 0, 1),
  [OrientationControlTargets.TOP_FROM_RIGHT]: new THREE.Quaternion(0, 0, Math.sqrt(2) / 2, Math.sqrt(2) / 2),
  [OrientationControlTargets.TOP_FROM_BACK]: new THREE.Quaternion(0, 0, 1, 0),
  [OrientationControlTargets.TOP_FROM_LEFT]: new THREE.Quaternion(0, 0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2),

  [OrientationControlTargets.BOTTOM_FROM_FRONT]: new THREE.Quaternion(1, 0, 0, 0),
  [OrientationControlTargets.BOTTOM_FROM_RIGHT]: new THREE.Quaternion(Math.sqrt(2) / 2, Math.sqrt(2) / 2, 0, 0),
  [OrientationControlTargets.BOTTOM_FROM_BACK]: new THREE.Quaternion(0, 1, 0, 0),
  [OrientationControlTargets.BOTTOM_FROM_LEFT]: new THREE.Quaternion(Math.sqrt(2) / 2, -Math.sqrt(2) / 2, 0, 0)
};

export interface OrientationControlClickEvent{
  target: OrientationControlTargets
}

export interface OrientationControlOptions{
  width?: number;
  height?: number;
  axis?: OrientationControlTargets | "none"
}

export class OrientationControl {
  width: number;
  height: number;
  pickHelper: PickHelper;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  cube: Container;
  element: HTMLElement;
  pointLight: THREE.PointLight;
  ambientLight: THREE.AmbientLight;
  renderer: THREE.WebGLRenderer;
  font: THREE.Font;
  fontMaterial: THREE.MeshBasicMaterial;
  edges: THREE.LineSegments;
  fontMeshes: {
    top: THREE.Mesh;
    bottom: THREE.Mesh;
    left: THREE.Mesh;
    right: THREE.Mesh;
    front: THREE.Mesh;
    back: THREE.Mesh;
  };
  surfaceMeshes: {
    top: THREE.Mesh;
    bottom: THREE.Mesh;
    left: THREE.Mesh;
    right: THREE.Mesh;
    front: THREE.Mesh;
    back: THREE.Mesh;
  };
  pickPosition: { x: number, y: number; };
  raycaster: THREE.Raycaster;
  _hoveredPlane: THREE.Mesh | undefined;
  shouldRender: boolean;
  cameraDistance: number;
  clickListeners: Map<string, (e: OrientationControlClickEvent) => void>;
  _axis: OrientationControlTargets | "none";
  helperArrows: {
    top: HTMLElement;
    bottom: HTMLElement;
    left: HTMLElement;
    right: HTMLElement;
    rotateLeft: HTMLElement;
    rotateRight: HTMLElement;
  }

  constructor(selector: string, opts?: OrientationControlOptions) {
    this.width = opts && opts.width || 180;
    this.height = opts && opts.height || 180;
    this.clickListeners = new Map<string, (e: OrientationControlClickEvent) => void>();
    this._axis = opts && opts.axis || "none";
    this.cameraDistance = 20;
    this.scene = new THREE.Scene();
    this.pickPosition = { x: 0, y: 0 };
    this.raycaster = new THREE.Raycaster();
    this.camera = new THREE.PerspectiveCamera(7.5, 1, 0.01, 50);
    this.camera.up.set(0, 0, 1);
    this.camera.position.set(0, -this.cameraDistance, 0);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    let elt = document.querySelector(selector) as HTMLElement;
    if (!elt) {
      elt = document.createElement('div');
      document.appendChild(elt);
    }
    this.element = elt;
    this.element.setAttribute("style", `
      width: ${this.width}px;
      height: ${this.height}px;
      left: calc(100% - .5em - ${this.width}px);
    `);
    this.element.setAttribute("class", "orientation_control");
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', this.width.toString());
    canvas.setAttribute('height', this.height.toString());
    this.element.appendChild(canvas);
    const size = 1;
    const halfsize = size / 2;


    
    const vertices = [
      [-halfsize, -halfsize, -halfsize],
      [+halfsize, -halfsize, -halfsize],
      [+halfsize, +halfsize, -halfsize],
      [-halfsize, +halfsize, -halfsize],
      
      [-halfsize, -halfsize, +halfsize],
      [+halfsize, -halfsize, +halfsize],
      [+halfsize, +halfsize, +halfsize],
      [-halfsize, +halfsize, +halfsize]
    ];
    
    const lines = [
      vertices[0], vertices[1],
      vertices[1], vertices[2],
      vertices[2], vertices[3],
      vertices[3], vertices[0],

      vertices[4], vertices[5],
      vertices[5], vertices[6],
      vertices[6], vertices[7],
      vertices[7], vertices[4],

      vertices[0], vertices[4],
      vertices[1], vertices[5],
      vertices[2], vertices[6],
      vertices[3], vertices[7]
    ] as number[][];
    
    const bufferGeometry = new THREE.BufferGeometry();
    const bufferAttribute = new THREE.Float32BufferAttribute(new Float32Array(lines.flat()), 3);
    bufferGeometry.setAttribute("position", bufferAttribute);
    const edgesMaterial = new THREE.LineDashedMaterial({
      color: 0x282929,
      transparent: true,
      opacity: 0.5,
      premultipliedAlpha: true,
      blending: THREE.NormalBlending,
      depthFunc: THREE.AlwaysDepth
    });
    
    this.edges = new THREE.LineSegments(bufferGeometry, edgesMaterial);
    // this.edges.renderOrder = -0.5;
    this.scene.add(this.edges);
    
    this.font = new THREE.Font(fontjson);
    this.fontMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.75,
      side: THREE.FrontSide
    });
    
    
    this.fontMeshes = {
      top: this.getMeshFromText("TOP"),
      bottom: this.getMeshFromText("BOTTOM"),
      left: this.getMeshFromText("LEFT"),
      right: this.getMeshFromText("RIGHT"),
      front: this.getMeshFromText("FRONT"),
      back: this.getMeshFromText("BACK")
    };

    this.fontMeshes.top.position.setZ((halfsize+0.01));
    
    this.fontMeshes.bottom.rotateX(Math.PI);
    this.fontMeshes.bottom.position.setZ(-(halfsize+0.01));
    
    this.fontMeshes.front.rotateX(Math.PI / 2);
    this.fontMeshes.front.position.setY(-(halfsize+0.01));
    
    this.fontMeshes.back.rotateX(Math.PI / 2);
    this.fontMeshes.back.rotateY(Math.PI);
    this.fontMeshes.back.position.setY((halfsize+0.01));
    
    this.fontMeshes.left.rotateX(Math.PI / 2);
    this.fontMeshes.left.rotateY(-Math.PI / 2);
    this.fontMeshes.left.position.setX(-(halfsize+0.01));

    this.fontMeshes.right.rotateX(Math.PI / 2);
    this.fontMeshes.right.rotateY(Math.PI / 2);
    this.fontMeshes.right.position.setX((halfsize+0.01));
    
    
    this.scene.add(this.fontMeshes.top);
    this.scene.add(this.fontMeshes.bottom);
    this.scene.add(this.fontMeshes.left);
    this.scene.add(this.fontMeshes.right);
    this.scene.add(this.fontMeshes.front);
    this.scene.add(this.fontMeshes.back);
   

    const materialParams: THREE.MeshLambertMaterialParameters = {
      color: 0xffffff,
      transparent: true,
      side: THREE.FrontSide,
      opacity: 0.75,
    };
    
    this.surfaceMeshes = {
      top: this.createPlaneMesh(size, materialParams),
      bottom: this.createPlaneMesh(size, materialParams),
      left: this.createPlaneMesh(size, materialParams),
      right: this.createPlaneMesh(size, materialParams),
      front: this.createPlaneMesh(size, materialParams),
      back: this.createPlaneMesh(size, materialParams)
    };
    
    this.surfaceMeshes.top.position.setZ(halfsize);
    this.surfaceMeshes.top.name = "TOP";

    this.surfaceMeshes.bottom.rotateX(Math.PI);
    this.surfaceMeshes.bottom.position.setZ(-halfsize);
    this.surfaceMeshes.bottom.name = "BOTTOM";
    
    this.surfaceMeshes.front.rotateX(Math.PI / 2);
    this.surfaceMeshes.front.position.setY(-halfsize);
    this.surfaceMeshes.front.name = "FRONT";
    
    this.surfaceMeshes.back.rotateX(Math.PI / 2);
    this.surfaceMeshes.back.rotateY(Math.PI);
    this.surfaceMeshes.back.position.setY(halfsize);
    this.surfaceMeshes.back.name = "BACK";
    
    this.surfaceMeshes.left.rotateX(Math.PI / 2);
    this.surfaceMeshes.left.rotateY(-Math.PI / 2);
    this.surfaceMeshes.left.position.setX(-halfsize);
    this.surfaceMeshes.left.name = "LEFT";
    
    this.surfaceMeshes.right.rotateX(Math.PI / 2);
    this.surfaceMeshes.right.rotateY(Math.PI / 2);
    this.surfaceMeshes.right.position.setX(halfsize);
    this.surfaceMeshes.right.name = "RIGHT";
    
    this.cube = new Container("cube");
    
    this.cube.add(this.surfaceMeshes.top);
    this.cube.add(this.surfaceMeshes.bottom);
    this.cube.add(this.surfaceMeshes.left);
    this.cube.add(this.surfaceMeshes.right);
    this.cube.add(this.surfaceMeshes.front);
    this.cube.add(this.surfaceMeshes.back);
    
    this.scene.add(this.cube);

    this.pointLight = new THREE.PointLight(0xffffff, .5);
    this.pointLight.position.set(0, -5, 0);
    this.scene.add(this.pointLight);
    
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);
    
    
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas
    });
    
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    
    this.pickHelper = new PickHelper(this.scene, this.camera, this.renderer.domElement);
    this._hoveredPlane = undefined;
    this.renderer.domElement.addEventListener("mousemove", e => {
      // const selection = this.pickHelper.pick(e, [this.cube]);
      this.setPickPosition(event, this.renderer.domElement);
      this.raycaster.setFromCamera(this.pickPosition, this.camera);
      const intersectedObjects = this.raycaster.intersectObjects([this.cube], true);
      if (intersectedObjects.length) {
        this.hoveredPlane = intersectedObjects[0].object as THREE.Mesh;
      }
      else {
        this.hoveredPlane = undefined;
      }
      this.shouldRender = true;
    });
    this.renderer.domElement.addEventListener("mousedown", e => {
      if (this.hoveredPlane) {
        const target = OrientationControlTargets[this.hoveredPlane.name];
        if (target) {
          this.clickListeners.forEach(listener => {
            listener({
              target
            });
          });
        }
      }
    });
    
    
    this.helperArrows = {
      top: document.createElement('div'),
      bottom: document.createElement('div'),
      left: document.createElement('div'),
      right: document.createElement('div'),
      rotateLeft: document.createElement('div'),
      rotateRight: document.createElement('div')
    }

    this.element.appendChild(this.helperArrows.top);
    this.element.appendChild(this.helperArrows.bottom);
    this.element.appendChild(this.helperArrows.left);
    this.element.appendChild(this.helperArrows.right);
    this.element.appendChild(this.helperArrows.rotateLeft);
    this.element.appendChild(this.helperArrows.rotateRight);
    
    const helperArrowMouseEnter = (e) => {
      this.hoveredPlane = undefined;
      if (e.target) {
        const elt = (e.target as HTMLElement).querySelector("path") as SVGElement;
        if (elt) {
          elt.setAttribute("fill", "#BFDEFD");
        }
      }
      this.shouldRender = true;
    };
    
    const helperArrowMouseLeave = (e) => {
      if (e.target) {
        const elt = (e.target as HTMLElement).querySelector("path") as SVGElement;
        if (elt) {
          elt.setAttribute("fill", "#ffffff");
        }
      }
    };
    
    const dispatchTarget = (target: OrientationControlTargets) => {
      this.clickListeners.forEach((listener) => listener({ target }));
    }
    
    const helperArrowMouseDown = (e) => {
      if (e.target) {
        let parent = e.target.parentElement;
        while (parent.tagName !== "DIV") {
          parent = parent.parentElement;
        }
        const elt = (parent as HTMLElement);
        if (this.axis !== "none") {
          switch (this.axis) {
            case OrientationControlTargets.TOP: {
              switch (elt.id) {
                case "helper-arrow-top": {dispatchTarget(OrientationControlTargets.BACK)} break;
                case "helper-arrow-bottom": {dispatchTarget(OrientationControlTargets.FRONT)} break;
                case "helper-arrow-left": {dispatchTarget(OrientationControlTargets.LEFT)} break;
                case "helper-arrow-right": {dispatchTarget(OrientationControlTargets.RIGHT)} break;
                case "helper-arrow-rotate-right": {dispatchTarget(OrientationControlTargets.TOP_FROM_RIGHT);} break;
                case "helper-arrow-rotate-left": {dispatchTarget(OrientationControlTargets.TOP_FROM_LEFT)} break;
                default: break;
              }
            } break;
            case OrientationControlTargets.BOTTOM: {
              switch (elt.id) {
                case "helper-arrow-top": {dispatchTarget(OrientationControlTargets.FRONT)} break;
                case "helper-arrow-bottom": {dispatchTarget(OrientationControlTargets.BACK)} break;
                case "helper-arrow-left": {dispatchTarget(OrientationControlTargets.LEFT)} break;
                case "helper-arrow-right": { dispatchTarget(OrientationControlTargets.RIGHT); } break;
                case "helper-arrow-rotate-right": {dispatchTarget(OrientationControlTargets.BOTTOM_FROM_LEFT)} break;
                case "helper-arrow-rotate-left": {dispatchTarget(OrientationControlTargets.BOTTOM_FROM_RIGHT)} break;
                default: break;
              }
            } break;
            case OrientationControlTargets.RIGHT: {
              switch (elt.id) {
                case "helper-arrow-top": {dispatchTarget(OrientationControlTargets.TOP_FROM_RIGHT)} break;
                case "helper-arrow-bottom": {dispatchTarget(OrientationControlTargets.BOTTOM_FROM_RIGHT)} break;
                case "helper-arrow-left": {dispatchTarget(OrientationControlTargets.FRONT)} break;
                case "helper-arrow-right": {dispatchTarget(OrientationControlTargets.BACK)} break;
                default: break;
              }
            } break;
            case OrientationControlTargets.LEFT: {
              switch (elt.id) {
                case "helper-arrow-top": {dispatchTarget(OrientationControlTargets.TOP_FROM_LEFT)} break;
                case "helper-arrow-bottom": {dispatchTarget(OrientationControlTargets.BOTTOM_FROM_LEFT)} break;
                case "helper-arrow-left": {dispatchTarget(OrientationControlTargets.BACK)} break;
                case "helper-arrow-right": {dispatchTarget(OrientationControlTargets.FRONT)} break;
                default: break;
              }
            } break;
            case OrientationControlTargets.FRONT: {
              switch (elt.id) {
                case "helper-arrow-top": {dispatchTarget(OrientationControlTargets.TOP)} break;
                case "helper-arrow-bottom": {dispatchTarget(OrientationControlTargets.BOTTOM)} break;
                case "helper-arrow-left": {dispatchTarget(OrientationControlTargets.LEFT)} break;
                case "helper-arrow-right": {dispatchTarget(OrientationControlTargets.RIGHT)} break;
                default: break;
              }
            } break;
            case OrientationControlTargets.BACK: {
              switch (elt.id) {
                case "helper-arrow-top": {dispatchTarget(OrientationControlTargets.TOP_FROM_BACK)} break;
                case "helper-arrow-bottom": {dispatchTarget(OrientationControlTargets.BOTTOM_FROM_BACK)} break;
                case "helper-arrow-left": {dispatchTarget(OrientationControlTargets.RIGHT)} break;
                case "helper-arrow-right": {dispatchTarget(OrientationControlTargets.LEFT)} break;
                default: break;
              }
            } break;
            case OrientationControlTargets.TOP_FROM_BACK: {
              switch (elt.id) {
                case "helper-arrow-top": {dispatchTarget(OrientationControlTargets.FRONT)} break;
                case "helper-arrow-bottom": {dispatchTarget(OrientationControlTargets.BACK)} break;
                case "helper-arrow-left": {dispatchTarget(OrientationControlTargets.RIGHT)} break;
                case "helper-arrow-right": { dispatchTarget(OrientationControlTargets.LEFT); } break;
                case "helper-arrow-rotate-right": {dispatchTarget(OrientationControlTargets.TOP_FROM_LEFT);} break;
                case "helper-arrow-rotate-left": {dispatchTarget(OrientationControlTargets.TOP_FROM_RIGHT)} break;
                default: break;
              }
            } break;
            case OrientationControlTargets.TOP_FROM_FRONT: {
              switch (elt.id) {
                case "helper-arrow-top": {dispatchTarget(OrientationControlTargets.BACK)} break;
                case "helper-arrow-bottom": {dispatchTarget(OrientationControlTargets.FRONT)} break;
                case "helper-arrow-left": {dispatchTarget(OrientationControlTargets.LEFT)} break;
                case "helper-arrow-right": { dispatchTarget(OrientationControlTargets.RIGHT); } break;
                case "helper-arrow-rotate-right": {dispatchTarget(OrientationControlTargets.TOP_FROM_LEFT)} break;
                case "helper-arrow-rotate-left": {dispatchTarget(OrientationControlTargets.TOP_FROM_RIGHT)} break;
                default: break;
              }
            } break;
            case OrientationControlTargets.TOP_FROM_LEFT: {
              switch (elt.id) {
                case "helper-arrow-top": {dispatchTarget(OrientationControlTargets.RIGHT)} break;
                case "helper-arrow-bottom": {dispatchTarget(OrientationControlTargets.LEFT)} break;
                case "helper-arrow-left": {dispatchTarget(OrientationControlTargets.BACK)} break;
                case "helper-arrow-right": { dispatchTarget(OrientationControlTargets.FRONT); } break;
                case "helper-arrow-rotate-right": {dispatchTarget(OrientationControlTargets.TOP)} break;
                case "helper-arrow-rotate-left": {dispatchTarget(OrientationControlTargets.TOP_FROM_BACK)} break;
                default: break;
              }
            } break;
            case OrientationControlTargets.TOP_FROM_RIGHT: {
              switch (elt.id) {
                case "helper-arrow-top": {dispatchTarget(OrientationControlTargets.LEFT)} break;
                case "helper-arrow-bottom": {dispatchTarget(OrientationControlTargets.RIGHT)} break;
                case "helper-arrow-left": {dispatchTarget(OrientationControlTargets.FRONT)} break;
                case "helper-arrow-right": { dispatchTarget(OrientationControlTargets.BACK); } break;
                case "helper-arrow-rotate-right": {dispatchTarget(OrientationControlTargets.TOP_FROM_BACK);} break;
                case "helper-arrow-rotate-left": {dispatchTarget(OrientationControlTargets.TOP)} break;
                default: break;
              }
            } break;
            case OrientationControlTargets.BOTTOM_FROM_BACK: {
              switch (elt.id) {
                case "helper-arrow-top": {dispatchTarget(OrientationControlTargets.BACK)} break;
                case "helper-arrow-bottom": {dispatchTarget(OrientationControlTargets.FRONT)} break;
                case "helper-arrow-left": {dispatchTarget(OrientationControlTargets.RIGHT)} break;
                case "helper-arrow-right": { dispatchTarget(OrientationControlTargets.LEFT); } break;
                case "helper-arrow-rotate-right": {dispatchTarget(OrientationControlTargets.BOTTOM_FROM_RIGHT);} break;
                case "helper-arrow-rotate-left": {dispatchTarget(OrientationControlTargets.BOTTOM_FROM_LEFT)} break;
                default: break;
              }
            } break;
            case OrientationControlTargets.BOTTOM_FROM_FRONT: {
              switch (elt.id) {
                case "helper-arrow-top": {dispatchTarget(OrientationControlTargets.FRONT)} break;
                case "helper-arrow-bottom": {dispatchTarget(OrientationControlTargets.BACK)} break;
                case "helper-arrow-left": {dispatchTarget(OrientationControlTargets.LEFT)} break;
                case "helper-arrow-right": { dispatchTarget(OrientationControlTargets.RIGHT); } break;
                case "helper-arrow-rotate-right": {dispatchTarget(OrientationControlTargets.BOTTOM_FROM_LEFT);} break;
                case "helper-arrow-rotate-left": {dispatchTarget(OrientationControlTargets.BOTTOM_FROM_RIGHT);} break;
                default: break;
              }
            } break;
            case OrientationControlTargets.BOTTOM_FROM_LEFT: {
              switch (elt.id) {
                case "helper-arrow-top": {dispatchTarget(OrientationControlTargets.LEFT)} break;
                case "helper-arrow-bottom": {dispatchTarget(OrientationControlTargets.RIGHT)} break;
                case "helper-arrow-left": {dispatchTarget(OrientationControlTargets.BACK)} break;
                case "helper-arrow-right": { dispatchTarget(OrientationControlTargets.FRONT); } break;
                case "helper-arrow-rotate-right": {dispatchTarget(OrientationControlTargets.BOTTOM_FROM_BACK);} break;
                case "helper-arrow-rotate-left": {dispatchTarget(OrientationControlTargets.BOTTOM);} break;
                default: break;
              }
            } break;
            case OrientationControlTargets.BOTTOM_FROM_RIGHT: {
              switch (elt.id) {
                case "helper-arrow-top": {dispatchTarget(OrientationControlTargets.RIGHT)} break;
                case "helper-arrow-bottom": {dispatchTarget(OrientationControlTargets.LEFT)} break;
                case "helper-arrow-left": {dispatchTarget(OrientationControlTargets.FRONT)} break;
                case "helper-arrow-right": {dispatchTarget(OrientationControlTargets.BACK)} break;
                case "helper-arrow-rotate-right": {dispatchTarget(OrientationControlTargets.BOTTOM);} break;
                case "helper-arrow-rotate-left": {dispatchTarget(OrientationControlTargets.BOTTOM_FROM_BACK);} break;
                default: break;
              }
            } break;
            default: {
              console.log(this.axis);
            } break;
          }
        }
      }
    }
    
    this.helperArrows.top.setAttribute("id", "helper-arrow-top");
    this.helperArrows.top.setAttribute("class", "helper-arrow");
    this.helperArrows.top.innerHTML = helperArrow;
    this.helperArrows.top.addEventListener('mouseenter', helperArrowMouseEnter);
    this.helperArrows.top.addEventListener("mouseleave", helperArrowMouseLeave);
    this.helperArrows.top.addEventListener("mousedown", helperArrowMouseDown);
    
    this.helperArrows.bottom.setAttribute("id", "helper-arrow-bottom");
    this.helperArrows.bottom.setAttribute("class", "helper-arrow");
    this.helperArrows.bottom.innerHTML = helperArrow;
    this.helperArrows.bottom.addEventListener("mouseenter", helperArrowMouseEnter);
    this.helperArrows.bottom.addEventListener("mouseleave", helperArrowMouseLeave);
    this.helperArrows.bottom.addEventListener("mousedown", helperArrowMouseDown);
    
    this.helperArrows.left.setAttribute("id", "helper-arrow-left");
    this.helperArrows.left.setAttribute("class", "helper-arrow");
    this.helperArrows.left.innerHTML = helperArrow;
    this.helperArrows.left.addEventListener("mouseenter", helperArrowMouseEnter);
    this.helperArrows.left.addEventListener("mouseleave", helperArrowMouseLeave);
    this.helperArrows.left.addEventListener("mousedown", helperArrowMouseDown);
    
    this.helperArrows.right.setAttribute("id", "helper-arrow-right");
    this.helperArrows.right.setAttribute("class", "helper-arrow");
    this.helperArrows.right.innerHTML = helperArrow;
    this.helperArrows.right.addEventListener("mouseenter", helperArrowMouseEnter);
    this.helperArrows.right.addEventListener("mouseleave", helperArrowMouseLeave);
    this.helperArrows.right.addEventListener("mousedown", helperArrowMouseDown);
    
    this.helperArrows.rotateLeft.setAttribute("id", "helper-arrow-rotate-left");
    this.helperArrows.rotateLeft.setAttribute("class", "helper-arrow");
    this.helperArrows.rotateLeft.innerHTML = `<img src="${rotateLeft}"/>`;
    this.helperArrows.rotateLeft.addEventListener("mouseenter", helperArrowMouseEnter);
    this.helperArrows.rotateLeft.addEventListener("mouseleave", helperArrowMouseLeave);
    this.helperArrows.rotateLeft.addEventListener("mousedown", helperArrowMouseDown);
    
    this.helperArrows.rotateRight.setAttribute("id", "helper-arrow-rotate-right");
    this.helperArrows.rotateRight.setAttribute("class", "helper-arrow");
    this.helperArrows.rotateRight.innerHTML = `<img src="${rotateRight}"/>`;
    this.helperArrows.rotateRight.addEventListener("mouseenter", helperArrowMouseEnter);
    this.helperArrows.rotateRight.addEventListener("mouseleave", helperArrowMouseLeave);
    this.helperArrows.rotateRight.addEventListener("mousedown", helperArrowMouseDown);
    
    this.hideHelperArrows();

    this.axis = (opts && opts.axis) || "none";
    
    
    this.shouldRender = true;
    
  }
  setCameraTransforms(position: THREE.Vector3, quaternion: THREE.Quaternion) {

    this.camera.quaternion.copy(quaternion);
    this.camera.position.set(position.x, position.y, position.z);
    this.pointLight.position.set(position.x, position.y, position.z);
    this.camera.updateProjectionMatrix();
  }
  
  showHelperArrows(arrows: string[]) {
    Object.keys(this.helperArrows).forEach((x) => {
      if (arrows.includes(x)) {
        if (this.helperArrows[x].classList.contains("helper-arrow-hidden")) {
          this.helperArrows[x].classList.remove("helper-arrow-hidden");
        }
      }
      else {
        if (!this.helperArrows[x].classList.contains("helper-arrow-hidden")) {
          this.helperArrows[x].classList.add("helper-arrow-hidden");
        }
      }
    });
  }
  
  hideHelperArrows() {
    Object.keys(this.helperArrows).forEach(x => {
      if (!this.helperArrows[x].classList.contains("helper-arrow-hidden")) {
        this.helperArrows[x].classList.add("helper-arrow-hidden");
      }
    })
  }
  
  hide() {
    if (!this.element.classList.contains("orientation_control-hidden")) {
      this.element.classList.add("orientation_control-hidden");
    }
  }
  show() {
    if (this.element.classList.contains("orientation_control-hidden")) {
      this.element.classList.remove("orientation_control-hidden");
    }
  }
  
  addClickListener(listener: (e: OrientationControlClickEvent) => void) {
    const id = uuid();
    this.clickListeners.set(id, listener);
    return id;
  }
  
  removeClickListener(id: string) {
    if (this.clickListeners.has(id)) {
      this.clickListeners.delete(id);
    }
  }
  
  createPlaneMesh(size: number, materialParams: THREE.MeshLambertMaterialParameters) {
    const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(size, size), new THREE.MeshLambertMaterial(materialParams));
    mesh.userData.selectedColor = 0xbfdefd;
    mesh.userData.normalColor = materialParams.color || 0xffffff;
    return mesh;
  }
  
  getMeshFromText(text: string) {
    const shapes = this.font.generateShapes(text, 0.125, 4);
    const fontGeometry = new THREE.ShapeBufferGeometry(shapes);
    fontGeometry.computeBoundingBox();
    const xMid = -0.5 * (fontGeometry.boundingBox.max.x - fontGeometry.boundingBox.min.x);
    const yMid = -0.5 * (fontGeometry.boundingBox.max.y - fontGeometry.boundingBox.min.y);
    fontGeometry.translate(xMid, yMid, 0);
    return new THREE.Mesh(fontGeometry, this.fontMaterial);
  }
  
  setPickPosition(event, mount) {
    const pos = this.getCanvasRelativePosition(event, mount);
    // console.log(pos);
    // console.log(mount.clientWidth, mount.clientHeight);
    this.pickPosition.x = (pos.x / mount.clientWidth) * 2 - 1;
    this.pickPosition.y = (pos.y / mount.clientHeight) * -2 + 1;
  }
  
  setPickPositionCenter(mount) {
    const pos = { x: mount.clientWidth / 2, y: mount.clientHeight / 2 };
    this.pickPosition.x = (pos.x / mount.clientWidth) * 2 - 1;
    this.pickPosition.y = (pos.y / mount.clientHeight) * -2 + 1;
  }
  
  getCanvasRelativePosition(event, mount) {
    const rect = mount.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  
  clearPickPosition() {
    this.pickPosition.x = -100000;
    this.pickPosition.y = -100000;
  }
  
  save() {
    const saveObj = {
      axis: this.axis,
      width: this.width,
      height: this.height
    };
    return saveObj;
  }
  
  render() {
    if (this.shouldRender) {
      this.renderer.render(this.scene, this.camera);
      this.shouldRender = false;
    }
  }
  get axis() {
    return this._axis;
  }
  set axis(axis: OrientationControlTargets | "none") {

    if (axis !== "none") {
      if (
        axis === OrientationControlTargets.TOP ||
        axis === OrientationControlTargets.TOP_FROM_BACK ||
        axis === OrientationControlTargets.TOP_FROM_FRONT ||
        axis === OrientationControlTargets.TOP_FROM_LEFT ||
        axis === OrientationControlTargets.TOP_FROM_RIGHT ||
        axis === OrientationControlTargets.BOTTOM ||
        axis === OrientationControlTargets.BOTTOM_FROM_BACK ||
        axis === OrientationControlTargets.BOTTOM_FROM_FRONT ||
        axis === OrientationControlTargets.BOTTOM_FROM_LEFT ||
        axis === OrientationControlTargets.BOTTOM_FROM_RIGHT
      ) {
        this.showHelperArrows(["top", "bottom", "left", "right", "rotateLeft", "rotateRight"]);
      }
      else {
        this.showHelperArrows(["top", "bottom", "left", "right"]);
      }
    }
    else {
      if (this._axis !== "none") {
        this.hideHelperArrows();
      }
    }
    this._axis = axis;
  }
  get hoveredPlane() {
    return this._hoveredPlane;
  }
  set hoveredPlane(plane: THREE.Mesh | undefined) {
    if (this._hoveredPlane) {
      (this._hoveredPlane.material as THREE.MeshLambertMaterial).color.set(this._hoveredPlane.userData.normalColor);
    }
    if (plane) {
      (plane.material as THREE.MeshLambertMaterial).color.set(plane.userData.selectedColor);
    }
    this._hoveredPlane = plane;
  }
  
}