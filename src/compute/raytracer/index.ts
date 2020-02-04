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
import Source from '../../objects/source';
import Renderer from '../../render/renderer';
import Surface from '../../objects/surface';
import Receiver from '../../objects/receiver';
import { Stat } from '../../components/Gutter/Stats';

//@ts-ignore
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
//@ts-ignore
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;


export interface RayPath {
  intersectedReceiver: boolean;
  chain: THREE.Intersection[];
  time?: number;
}

export interface RayTracerParams {
  name?: string;
  sourceIDs?: string[],
  roomID?: string,
  surfaceIDs?: string[],
  containers?: KeyValuePair<Container>;
  receiverIDs?: string[],
  updateInterval?: number;
  reflectionOrder?: number;
  _isRunning?: boolean;
  renderer;
}

export const defaults = {
  name: "ray-tracer",
  roomID: "",
  sourceIDs: [] as string[],
  surfaceIDs: [] as string[],
  containers: ({} as KeyValuePair<Container>),
  receiverIDs: [] as string[],
  updateInterval: 20,
  reflectionOrder: 20,
  _isRunning: false
}

export default class RayTracer extends Solver {
  roomID: string;
  sourceIDs: string[];
  containers: KeyValuePair<Container|Room>;
  surfaceIDs: string[];
  receiverIDs: string[];
  updateInterval: number;
  reflectionOrder: number;
  raycaster: THREE.Raycaster;
  intersections: THREE.Intersection[];
  _isRunning: boolean;
  intervals: KeyValuePair<NodeJS.Timeout>;
  rayBufferGeometry: THREE.BufferGeometry;
  rayBufferAttribute: THREE.Float32BufferAttribute;
  rays: THREE.LineSegments;
  rayPositionIndex: number;
  maxrays: number;
  renderer: Renderer;
  intersectableObjects: Array<THREE.Mesh | THREE.Object3D | Container>;
  paths: KeyValuePair<RayPath[]>;
  stats: KeyValuePair<Stat>;
  constructor(params: RayTracerParams) { 
    super(params);
    this.kind = "ray-tracer";
    this.sourceIDs = params.sourceIDs || defaults.sourceIDs;
    this.surfaceIDs = params.surfaceIDs || defaults.surfaceIDs;
    this.roomID = params.roomID || defaults.roomID;
    this.containers = params.containers || defaults.containers;
    this.receiverIDs = params.receiverIDs || defaults.receiverIDs;
    this.updateInterval = params.updateInterval || defaults.updateInterval;
    this.reflectionOrder = params.reflectionOrder || defaults.reflectionOrder;
    this._isRunning = params._isRunning || defaults._isRunning;
    this.renderer = params.renderer;
    this.intervals = {} as KeyValuePair<NodeJS.Timeout>;
    this.raycaster = new THREE.Raycaster();
    this.rayBufferGeometry = new THREE.BufferGeometry();
    this.maxrays = 1e6-1;
    this.rayBufferAttribute = new THREE.Float32BufferAttribute(new Float32Array(this.maxrays), 3);
    this.rayBufferAttribute.setUsage(THREE.DynamicDrawUsage);
    this.rayBufferGeometry.setAttribute('position', this.rayBufferAttribute);
    this.rayBufferGeometry.setDrawRange(0, this.maxrays);
    this.rays = new THREE.LineSegments(
      this.rayBufferGeometry,
      new THREE.LineBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.5
      })
    );
    this.renderer.scene.add(this.rays);
    this.rayPositionIndex = 0;
    Object.defineProperty(this.raycaster, "firstHitOnly", {
      value: true,
      writable: true
    });
    // raycaster.intersectObjects([mesh]);
    this.intersections = [] as THREE.Intersection[];    
    this.findIDs();
    this.intersectableObjects = this.mapIntersectableObjects();
    this.paths = {} as KeyValuePair<RayPath[]>
    
    this.stats = {
      numRaysShot: {
        name: "# of rays shot",
        value: 0
      }
    }
    
    
    this.renderer.messenger.postMessage('STATS_SETUP', this.stats);
    
  }
  get sources() {
    return this.sourceIDs.map(x => this.containers[x]);
  }
  get receivers() {
    return this.receiverIDs.map(x => (this.containers[x] as Receiver).mesh) as THREE.Mesh[];
  }
  get room(): Room {
    return this.containers[this.roomID] as Room;
  }
  
  addSource(source: Source) {
    this.containers[source.uuid] = source;
    this.findIDs();
     this.intersectableObjects = this.mapIntersectableObjects();
  }
  addReceiver(rec: Receiver) {
    this.containers[rec.uuid] = rec;
    this.findIDs();
     this.intersectableObjects = this.mapIntersectableObjects();
  }
  
  mapIntersectableObjects() {
    return this.room.surfaces.children.map(
      (x: Surface) => x.mesh
    ).concat(this.receivers);
  }

  
  
  findIDs() {
    for (const key in this.containers) {
      if (this.containers[key].kind === "room") {
        this.roomID = key;
      } else if (this.containers[key].kind === "source") {
        this.sourceIDs.push(key);
      } else if (this.containers[key].kind === "receiver") {
        this.receiverIDs.push(key);
      } else if (this.containers[key].kind === "surface") {
        this.surfaceIDs.push(key);
      }
    }
  }
  
  get isRunning() {
    return this.running;
  }
  set isRunning(isRunning: boolean) {
    this.running = this.precheck && isRunning;
    if (this.running) {
      this.start();
    }
    else {
      this.stop();
    }
  }
  
  clearRays() {
    this.rayBufferGeometry.setDrawRange(0, 1);
    this.rayPositionIndex = 0;
    
  }
  
  appendRay(p1: THREE.Vector3, p2: THREE.Vector3) {
    // set p1
    this.rayBufferAttribute.setXYZ(this.rayPositionIndex++, p1.x, p1.y, p1.z);
    
    // set p2
    this.rayBufferAttribute.setXYZ(this.rayPositionIndex++, p2.x, p2.y, p2.z);
    
    //update the draw range
    this.rayBufferGeometry.setDrawRange(0, this.rayPositionIndex);
    
    // update three.js
    this.rayBufferAttribute.needsUpdate = true;
    
    //update version
    this.rayBufferAttribute.version++;

  }
  
  
  
  traceRay(ro: THREE.Vector3, rd: THREE.Vector3, order: number, energy: number, iter: number = 1, chain: THREE.Intersection[] = []) {
    rd = rd.normalize();
    // set the starting position
    this.raycaster.ray.origin = ro;
    // console.log("org", this.raycaster.ray.origin);
    
    // set the direction
    this.raycaster.ray.direction = rd;
    // console.log("dir",this.raycaster.ray.direction);
    
    // find the surface that the ray intersects
    const intersections = this.raycaster.intersectObjects(this.intersectableObjects, true); 
    
    
    
    // if there was an intersection
    if (intersections.length > 0) {
      // console.log("itx",intersections[0].point)
      
      //check to see if the intersection was with a receiver
      if (
        intersections[0].object.userData["kind"] &&
        intersections[0].object.userData["kind"] === "receiver"
      ) {
        chain.push(intersections[0]);
        return { chain, intersectedReceiver: true } as RayPath;
      }
      else {
        // find the incident angle
        const angle =
          intersections[0].face &&
          rd
            .clone()
            .multiplyScalar(-1)
            .angleTo(intersections[0].face.normal);
      
        // this.appendRay(ro, intersections[0].point);
        chain.push(intersections[0]);
      
        // get the normal direction of the intersection
        const normal = intersections[0].face && intersections[0].face.normal.normalize();
        // console.log(normal);
      
        // find the new direction for the ray to travel
        const rr = (normal && intersections[0].face) &&
          // rr = ri - 2N*(ri•N)
          rd.clone()
            .sub(normal.clone()
              .multiplyScalar(rd.dot(normal.clone()))
              .multiplyScalar(2));
      
        if (iter < order && rr && normal) {
          return this.traceRay(intersections[0].point.clone().addScaledVector(normal.clone(), 0.01), rr, order, energy, iter + 1, chain);
        }
      }
      return { chain, intersectedReceiver: false } as RayPath;
    }
    
  }
  startAllMonteCarlo() {
    for (let i = 0; i < this.sourceIDs.length; i++) {
      this.intervals[this.sourceIDs[i]] = setInterval(
        (() => {
          const t = (Math.random() - 0.5) * (this.containers[this.sourceIDs[i]] as Source).theta;
          const p = (Math.random() - 0.5) * (this.containers[this.sourceIDs[i]] as Source).phi;
          
          // starting position
          const position = (this.containers[this.sourceIDs[i]] as Source).position;
          // random direction
          const direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
          //get the path traced buy the ray
          const path = this.traceRay(position, direction, this.reflectionOrder, 1.0);
        
          if (path.intersectedReceiver) {
            this.appendRay(position, (path.chain[0] as THREE.Intersection).point);
            let time = 0;
            for (let i = 1; i < path.chain.length; i++){
              this.appendRay(
                (path.chain[i-1] as THREE.Intersection).point,
                (path.chain[i] as THREE.Intersection).point
              );
            }
            const index = ((path.chain[path.chain.length - 1] as THREE.Intersection).object as Receiver).uuid
            this.paths[index]
              ? this.paths[index].push(path)
              : this.paths[index] = [path];
          }
          (this.stats.numRaysShot.value as number)++;
          
          
          
          this.renderer.messenger.postMessage("STATS_UPDATE", this.stats);
          (this.containers[this.sourceIDs[i]] as Source).numRays++;
        }).bind(this),
        this.updateInterval
      )
    }
  }
  calculateTotalPathTime(path: RayPath) {
    path.time = 0;
    for (let i = 0; i < path.chain.length; i++){
      path.time += path.chain[i].distance / 343.2;
    }
    return path;
  }
  update = () => {
    console.log('a');
  }
  start() {
    // this.raycaster.ray.origin = this.sources[0].position;
    // this.raycaster.ray.direction = new THREE.Vector3(Math.random(), Math.random(), Math.random());
    // this.intersections = [] as THREE.Intersection[];
    // this.raycaster.intersectObjects([this.surfaces], true, this.intersections);
    this.startAllMonteCarlo();
  }
  stop() {
    for (const key in this.intervals) {
      clearInterval(this.intervals[key]);
    }
    Object.keys(this.paths).forEach(key => {
      this.paths[key].forEach(p => {
        this.calculateTotalPathTime(p);
      });
    });
    console.log(this.paths);
  }
  
  get precheck() {
    return ((this.sourceIDs.length > 0) && (typeof this.room !== "undefined"))
  }
}