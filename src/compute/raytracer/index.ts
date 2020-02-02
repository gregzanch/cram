import Solver from '../solver';
import * as THREE from 'three';
import Room from '../../objects/room';
import { KeyValuePair } from '../../common/key-value-pair';
import Container from '../../objects/container'
import enumerable from '../../common/enumerable';
import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast
} from 'three-mesh-bvh';

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;


export interface RayTracerParams {
  name?: string;
  sourceIDs?: string[],
  surfaceIDs?: string[],
  containers?: KeyValuePair<Container>;
  receiverIDs?:string[],
  updateInterval?: number;
  reflectionOrder?: number;
}

export const defaults = {
  name: "ray-tracer",
  sourceIDs: [] as string[],
  surfaceIDs: [] as string[],
  containers: ({} as KeyValuePair<Container>),
  receiverIDs: [] as string[],
  updateInterval: 20,
  reflectionOrder: 20,
}

export default class RayTracer extends Solver {
  sourceIDs: string[];
  containers: KeyValuePair<Container>;
  surfaceIDs: string[];
  receiverIDs: string[];
  updateInterval: number;
  reflectionOrder: number;
  raycaster: THREE.Raycaster;
  intersections: THREE.Intersection[];
  constructor(params: RayTracerParams) { 
    super(params);
    this.kind = "ray-tracer";
    this.sourceIDs = params.sourceIDs || defaults.sourceIDs;
    this.surfaceIDs = params.surfaceIDs || defaults.surfaceIDs;
    this.containers = params.containers || defaults.containers;
    this.receiverIDs = params.receiverIDs || defaults.receiverIDs;
    this.updateInterval = params.updateInterval || defaults.updateInterval;
    this.reflectionOrder = params.reflectionOrder || defaults.reflectionOrder;
    this.raycaster = new THREE.Raycaster();
    Object.defineProperty(this.raycaster, "firstHitOnly", {
      value: true,
      writable: true
    });
    // raycaster.intersectObjects([mesh]);
    this.intersections = [] as THREE.Intersection[];
    
    this.findIDs();
  }
  get sources() {
    return this.sourceIDs.map(x => this.containers[x]);
  }
  get receivers() {
    return this.receiverIDs.map(x => this.containers[x]);
  }
  get surfaces() {
    return this.surfaceIDs.map(x => this.containers[x]);
  }
  
  
  
  findIDs() {
    for (const key in this.containers) {
      if (this.containers[key].kind === "source") {
        this.sourceIDs.push(key);
      }
      else if (this.containers[key].kind === "receiver") {
        this.receiverIDs.push(key);
      }
      else if (this.containers[key].kind === "surface") {
        this.surfaceIDs.push(key);
      }
    }
  }
  
  start() {
    this.intersections = [] as THREE.Intersection[];
    this.raycaster.intersectObjects(this.surfaces,true,this.intersections);
  }
  
  precheck() {
    return ((this.sourceIDs.length > 0) && (this.surfaceIDs.length > 0))
  }
}