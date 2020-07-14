import Solver from "../solver";
import * as THREE from "three";
import Room from "../../objects/room";
import { KVP } from "../../common/key-value-pair";
import Container from "../../objects/container";
import enumerable from "../../common/enumerable";
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from "three-mesh-bvh";
import Source from "../../objects/source";
import Renderer from "../../render/renderer";
import Surface from "../../objects/surface";
import Receiver from "../../objects/receiver";
import { Stat } from "../../components/parameter-config/Stats";
import Messenger from "../../messenger";
import sort from "fast-sort";
import FileSaver from "file-saver";
import Plotly, { PlotData } from 'plotly.js';
import { scatteredEnergy } from "./scattered-energy";
import PointShader from "./shaders/points";
import * as ac from '../acoustics';
// import wasmInit from "../../as/wasm-init";
// import loader from "@assemblyscript/loader";
import { clamp } from "../../common/clamp";
import { lerp } from "../../common/lerp";
import { movingAverage } from "../../common/moving-average";
import linearRegression, { LinearRegressionResult } from "../../common/linear-regression";
import { BSP } from './bsp';

import expose from "../../common/expose";
import { reverseTraverse } from "../../common/reverse-traverse";

expose({ Plotly });


export interface QuickEstimateStepResult {
  rt60s: number[];
  angle: number;
  direction: THREE.Vector3;
  lastIntersection: THREE.Intersection;
  distance: number;
}

//@ts-ignore
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
//@ts-ignore
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export interface RayPathResult{
  time: number;
  bounces: number;
  level: number[];
};

export interface ResponseByIntensity{
  freqs: number[];
  response: RayPathResult[];
  sampleRate?: number;
  resampledResponse?: Float32Array[];
  t20?: LinearRegressionResult[];
  t30?: LinearRegressionResult[];
  t60?: LinearRegressionResult[];
}

export interface Chain {
  angle_in: number;
  angle_out: number;
  total_time: number;
  time_rec: number;
  angle_rec: number;
  distance: number;
  // point: THREE.Vector3;
  point: [number, number, number];
  object: string;
  faceNormal: [number,number,number];
  faceIndex: number;
  faceMaterialIndex: number;
  angle: number;
  energy: number;
}
const { abs, floor, asin } = Math;

export interface RayPath {
  intersectedReceiver: boolean;
  chain: Chain[];
  chainLength: number;
  energy: number;
  time: number;
  source: string;
}
export interface EnergyTime {
  time: number;
  energy: {
    frequency: number;
    value: number;
  }[];
}
// helper type
export type ChartData = {
  label: string;
  data: number[][];
  x?: number[];
  y?: number[];
};

export interface ReceiverData {
  id: string;
  data: EnergyTime[];
}
export class ReceiverData {
  constructor(id: string) {
    this.id = id;
    this.data = [] as EnergyTime[];
  }
}



export interface RayTracerParams {
  renderer;
  messenger: Messenger;
  name?: string;
  roomID?: string;
  sourceIDs?: string[];
  surfaceIDs?: string[];
  containers?: KVP<Container>;
  receiverIDs?: string[];
  updateInterval?: number;
  passes?: number;
  pointSize?: number;
  reflectionOrder?: number;
  isRunning?: boolean;
  runningWithoutReceivers?: boolean;
  raysVisible?: boolean;
  pointsVisible?: boolean;
  invertedDrawStyle?: boolean;
  plotStyle?: Partial<PlotData>;
  uuid?: string;
  paths?: KVP<RayPath[]>;
}
export const defaults = {
  name: "Ray Tracer",
  roomID: "",
  sourceIDs: [] as string[],
  surfaceIDs: [] as string[],
  containers: {} as KVP<Container>,
  receiverIDs: [] as string[],
  updateInterval: 20,
  reflectionOrder: 200,
  isRunning: false,
  runningWithoutReceivers: false,
  passes: 1,
  pointSize: 2,
  raysVisible: true,
  pointsVisible: true,
  invertedDrawStyle: false,
  paths: {} as KVP<RayPath[]>,
  plotStyle: {
    mode: "lines"
  } as Partial<PlotData>
};

export enum DRAWSTYLE {
  ENERGY = 0.0,
  ANGLE = 1.0,
  ANGLE_ENERGY = 2.0
}
export interface DrawStyle {
  ANGLE: 0.0;
  ENERGY: 1.0;
  ANGLE_ENERGY: 2.0;
}
class RayTracer extends Solver {
  roomID: string;
  sourceIDs: string[];
  containers: KVP<Container | Room>;
  surfaceIDs: string[];
  receiverIDs: string[];
  updateInterval: number;
  reflectionOrder: number;
  raycaster: THREE.Raycaster;
  intersections: THREE.Intersection[];
  _isRunning: boolean;
  intervals: NodeJS.Timeout[];
  rayBufferGeometry: THREE.BufferGeometry;
  rayBufferAttribute: THREE.Float32BufferAttribute;
  colorBufferAttribute: THREE.Float32BufferAttribute;
  rays: THREE.LineSegments;
  rayPositionIndex: number;
  maxrays: number;
  renderer: Renderer;
  intersectableObjects: Array<THREE.Mesh | THREE.Object3D | Container>;
  paths: KVP<RayPath[]>;
  stats: KVP<Stat>;
  messenger: Messenger;
  messageHandlerIDs: string[][];
  statsUpdatePeriod: number;
  lastTime: number;
  _runningWithoutReceivers: boolean;
  reflectionLossFrequencies: number[];
  allReceiverData!: ReceiverData[];
  hits: THREE.Points;
  _pointSize: number;
  chartdata: ChartData[];
  passes: number;
  _raysVisible: boolean;
  _pointsVisible: boolean;
  _invertedDrawStyle: boolean;
  __start_time!: number;
  __calc_time!: number;
  __num_checked_paths!: number;
  responseOverlayElement: HTMLElement;
  quickEstimateResults: KVP<QuickEstimateStepResult[]>;
  responseByIntensity!: KVP<KVP<ResponseByIntensity>>;
  defaultFrequencies: number[];
  plotData: Plotly.Data[];
  intensitySampleRate: number;
  validRayCount: number;
  plotStyle: Partial<PlotData>;
  bsp: BSP;
  constructor(params: RayTracerParams) {
    super(params);
    this.kind = "ray-tracer";
    this.uuid = params.uuid || this.uuid;
    this.name = params.name || defaults.name;
    this.responseOverlayElement = document.querySelector("#response-overlay") || document.createElement("div");
    this.responseOverlayElement.style.backgroundColor = "#FFFFFF";
    this.sourceIDs = params.sourceIDs || defaults.sourceIDs;
    this.surfaceIDs = params.surfaceIDs || defaults.surfaceIDs;
    this.roomID = params.roomID || defaults.roomID;
    this.containers = params.containers || defaults.containers;
    this.receiverIDs = params.receiverIDs || defaults.receiverIDs;
    this.updateInterval = params.updateInterval || defaults.updateInterval;
    this.reflectionOrder = params.reflectionOrder || defaults.reflectionOrder;
    this._isRunning = params.isRunning || defaults.isRunning;
    this._runningWithoutReceivers = params.runningWithoutReceivers || defaults.runningWithoutReceivers;
    this.renderer = params.renderer;
    this.reflectionLossFrequencies = [4000];
    this.intervals = [];
    this.plotData = [] as Plotly.Data[];
    this.plotStyle = params.plotStyle || defaults.plotStyle;
    this.lastTime = Date.now();
    this.statsUpdatePeriod = 100;
    this._pointSize = params.pointSize || defaults.pointSize;
    this.validRayCount = 0;
    this.defaultFrequencies = [1000];
    this.intensitySampleRate = 256;
    this.quickEstimateResults = {} as KVP<QuickEstimateStepResult[]>;

    const paramsHasRaysVisible = typeof params.raysVisible === "boolean";
    this._raysVisible = paramsHasRaysVisible ? params.raysVisible! : defaults.raysVisible;

    const paramsHasPointsVisible = typeof params.pointsVisible === "boolean";
    this._pointsVisible = paramsHasPointsVisible ? params.pointsVisible! : defaults.pointsVisible;

    const paramsHasInvertedDrawStyle = typeof params.invertedDrawStyle === "boolean";
    this._invertedDrawStyle = paramsHasInvertedDrawStyle ? params.invertedDrawStyle! : defaults.invertedDrawStyle;

    this.passes = params.passes || defaults.passes;
    this.raycaster = new THREE.Raycaster();
    this.rayBufferGeometry = new THREE.BufferGeometry();
    this.rayBufferGeometry.name = "raytracer-ray-buffer-geometry";
    this.maxrays = 1e6 - 1;
    this.rayBufferAttribute = new THREE.Float32BufferAttribute(new Float32Array(this.maxrays), 3);
    this.rayBufferAttribute.setUsage(THREE.DynamicDrawUsage);
    this.rayBufferGeometry.setAttribute("position", this.rayBufferAttribute);
    this.rayBufferGeometry.setDrawRange(0, this.maxrays);
    this.colorBufferAttribute = new THREE.Float32BufferAttribute(new Float32Array(this.maxrays), 2);
    this.colorBufferAttribute.setUsage(THREE.DynamicDrawUsage);
    this.rayBufferGeometry.setAttribute("color", this.colorBufferAttribute);
    this.chartdata = [] as ChartData[];
    this.rays = new THREE.LineSegments(
      this.rayBufferGeometry,
      new THREE.LineBasicMaterial({
        fog: false,
        color: 0x282929,
        transparent: true,
        opacity: 0.2,
        premultipliedAlpha: true,
        blending: THREE.NormalBlending,
        depthFunc: THREE.AlwaysDepth,
        name: "raytracer-rays-material"
        // depthTest: false
      })
    );
    this.rays.renderOrder = -0.5;
    this.rays.frustumCulled = false;
    this.renderer.scene.add(this.rays);

    var shaderMaterial = new THREE.ShaderMaterial({
      fog: false,
      vertexShader: PointShader.vs,
      fragmentShader: PointShader.fs,
      transparent: true,
      premultipliedAlpha: true,
      uniforms: {
        drawStyle: { value: DRAWSTYLE.ENERGY },
        inverted: { value: 0.0 },
        pointScale: { value: this._pointSize }
      },
      blending: THREE.NormalBlending,
      name: "raytracer-points-material"
    });
    // var pointsMaterial = new THREE.PointsMaterial({fog:false,
    //   color: 0xff0000,
    //   transparent: true,
    //   opacity: 0.2,
    //   premultipliedAlpha: true,
    //   blending: THREE.NormalBlending
    // });
    this.hits = new THREE.Points(this.rayBufferGeometry, shaderMaterial);
    this.hits.frustumCulled = false;
    this.renderer.scene.add(this.hits);
    this.rayPositionIndex = 0;
    Object.defineProperty(this.raycaster, "firstHitOnly", {
      value: true,
      writable: true
    });

    this.bsp = new BSP();
    
    // raycaster.intersectObjects([mesh]);
    this.intersections = [] as THREE.Intersection[];
    this.findIDs();
    this.intersectableObjects = [] as Array<THREE.Mesh | THREE.Object3D | Container>;
    this.paths = params.paths || defaults.paths;
    this.stats = {
      numRaysShot: {
        name: "# of rays shot",
        value: 0
      },
      numValidRayPaths: {
        name: "# of valid rays",
        value: 0
      }
    };
    this.renderer.overlays.global.addCell("Valid Rays", this.validRayCount, {
      id: this.uuid + "-valid-ray-count",
      hidden: true,
      formatter: (value: number) => String(value)
    });
    this.messenger = params.messenger;
    this.messageHandlerIDs = [] as string[][];
    this.messenger.postMessage("STATS_SETUP", this.stats);
    this.messageHandlerIDs.push(
      this.messenger.addMessageHandler("RAYTRACER_SOURCE_CHANGE", (acc, ...args) => {
        console.log(args && args[0] && args[0] instanceof Array && args[1] && args[1] === this.uuid);
        if (args && args[0] && args[0] instanceof Array && args[1] && args[1] === this.uuid) {
          this.sourceIDs = args[0].map((x) => x.id);
        }
      })
    );
    this.messageHandlerIDs.push(
      this.messenger.addMessageHandler("RAYTRACER_RECEIVER_CHANGE", (acc, ...args) => {
        if (args && args[0] && args[0] instanceof Array && args[1] && args[1] === this.uuid) {
          this.receiverIDs = args[0].map((x) => x.id);
        }
      })
    );
    this.messageHandlerIDs.push(
      this.messenger.addMessageHandler("SHOULD_REMOVE_CONTAINER", (acc, ...args) => {
        const id = args[0];
        if (id) {
          console.log(id);
          if (this.sourceIDs.includes(id)) {
            this.sourceIDs = this.sourceIDs.filter((x) => x != id);
          } else if (this.receiverIDs.includes(id)) {
            this.receiverIDs = this.receiverIDs.filter((x) => x != id);
          }
        }
      })
    );
    this.step = this.step.bind(this);
    
    
    
  }
  update = () => {};
  save() {
    const {
      name,
      kind,
      uuid,
      roomID,
      sourceIDs,
      surfaceIDs,
      receiverIDs,
      updateInterval,
      passes,
      pointSize,
      reflectionOrder,
      runningWithoutReceivers,
      raysVisible,
      pointsVisible,
      invertedDrawStyle,
      plotStyle,
      paths
    } = this;
    return {
      name,
      kind,
      uuid,
      roomID,
      sourceIDs,
      surfaceIDs,
      receiverIDs,
      updateInterval,
      passes,
      pointSize,
      reflectionOrder,
      runningWithoutReceivers,
      raysVisible,
      pointsVisible,
      invertedDrawStyle,
      plotStyle,
      paths
    };
  }
  removeMessageHandlers() {
    this.messageHandlerIDs.forEach((x) => {
      this.messenger.removeMessageHandler(x[0], x[1]);
    });
  }
  dispose() {
    this.removeMessageHandlers();
    this.renderer.scene.remove(this.rays);
    this.renderer.scene.remove(this.hits);
  }
  addSource(source: Source) {
    this.containers[source.uuid] = source;
    this.findIDs();
    this.mapIntersectableObjects();
  }
  addReceiver(rec: Receiver) {
    this.containers[rec.uuid] = rec;
    this.findIDs();
    this.mapIntersectableObjects();
  }

  mapIntersectableObjects() {
    function mapSurfaces(container: Container, surfaces: THREE.Mesh[] = [] as THREE.Mesh[]) {
      if (container instanceof Surface) {
        surfaces.push(container.mesh);
      } else {
        container.children.forEach((x: Container) => {
          mapSurfaces(x, surfaces);
        });
      }
      return surfaces;
    }

    if (this.runningWithoutReceivers) {
      this.intersectableObjects = mapSurfaces(this.room.surfaces);
    } else {
      this.intersectableObjects = mapSurfaces(this.room.surfaces).concat(this.receivers);
    }
  }

  findIDs() {
    this.sourceIDs = [];
    this.receiverIDs = [];
    this.surfaceIDs = [];
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
    this.mapIntersectableObjects();
  }

  setDrawStyle(drawStyle: number) {
    (this.hits.material as THREE.ShaderMaterial).uniforms["drawStyle"].value = drawStyle;
    (this.hits.material as THREE.ShaderMaterial).needsUpdate = true;
    this.renderer.needsToRender = true;
  }

  setPointScale(scale: number) {
    this._pointSize = scale;
    (this.hits.material as THREE.ShaderMaterial).uniforms["pointScale"].value = this._pointSize;
    (this.hits.material as THREE.ShaderMaterial).needsUpdate = true;
    this.renderer.needsToRender = true;
  }

  appendRay(p1: [number, number, number], p2: [number, number, number], energy: number = 1.0, angle: number = 1.0) {
    // set p1
    this.rayBufferAttribute.setXYZ(this.rayPositionIndex++, p1[0], p1[1], p1[2]);

    // set the color
    this.colorBufferAttribute.setXY(this.rayPositionIndex, energy, angle);

    // set p2
    this.rayBufferAttribute.setXYZ(this.rayPositionIndex++, p2[0], p2[1], p2[2]);

    // set the color
    this.colorBufferAttribute.setXY(this.rayPositionIndex, energy, angle);

    //update the draw range
    this.rayBufferGeometry.setDrawRange(0, this.rayPositionIndex);

    // update three.js
    this.rayBufferAttribute.needsUpdate = true;

    //update version
    this.rayBufferAttribute.version++;

    // update three.js
    this.colorBufferAttribute.needsUpdate = true;

    //update version
    this.colorBufferAttribute.version++;
  }

  inFrontOf(a: THREE.Triangle, b: THREE.Triangle) {
    const plane = a.getPlane(new THREE.Plane());
    const pleq = new THREE.Vector4(plane.normal.x, plane.normal.y, plane.normal.z, plane.constant);
    const avec4 = new THREE.Vector4(b.a.x, b.a.y, b.a.z, 1);
    const bvec4 = new THREE.Vector4(b.b.x, b.b.y, b.b.z, 1);
    const cvec4 = new THREE.Vector4(b.c.x, b.c.y, b.c.z, 1);
    return pleq.dot(avec4) > 0 || pleq.dot(bvec4) > 0 || pleq.dot(cvec4) > 0;
  }

  traceRay(
    ro: THREE.Vector3,
    rd: THREE.Vector3,
    order: number,
    energy: number,
    source: string,
    iter: number = 1,
    chain: Partial<Chain>[] = [],
    frequency = 4000
  ) {
    // normalize the ray
    rd = rd.normalize();

    // set the starting position
    this.raycaster.ray.origin = ro;

    // set the direction
    this.raycaster.ray.direction = rd;

    // console.log("dir",this.raycaster.ray.direction);

    // find the surface that the ray intersects
    const intersections = this.raycaster.intersectObjects(this.intersectableObjects, true);

    // if there was an intersection
    if (intersections.length > 0) {
      // console.log("itx",intersections[0].point)

      //check to see if the intersection was with a receiver
      if (intersections[0].object.userData?.kind === "receiver") {
        // find the incident angle
        const angle = intersections[0].face && rd.clone().multiplyScalar(-1).angleTo(intersections[0].face.normal);

        // push the intersection data onto the chain

        chain.push({
          object: intersections[0].object.parent!.uuid,
          angle: angle!,
          distance: intersections[0].distance,
          faceNormal: [
            intersections[0].face!.normal.x,
            intersections[0].face!.normal.y,
            intersections[0].face!.normal.z
          ],
          faceMaterialIndex: intersections[0].face!.materialIndex,
          faceIndex: intersections[0].faceIndex!,
          point: [intersections[0].point.x, intersections[0].point.y, intersections[0].point.z],
          energy: energy!
        });

        // end the chain here
        return {
          chain,
          chainLength: chain.length,
          intersectedReceiver: true,
          energy,
          source
        } as RayPath;
      } else {
        // find the incident angle
        const angle = intersections[0].face && rd.clone().multiplyScalar(-1).angleTo(intersections[0].face.normal);

        // push the intersection onto the chain
        chain.push({
          object: intersections[0].object.parent!.uuid,
          angle: angle!,
          distance: intersections[0].distance,
          faceNormal: [
            intersections[0].face!.normal.x,
            intersections[0].face!.normal.y,
            intersections[0].face!.normal.z
          ],
          faceMaterialIndex: intersections[0].face!.materialIndex,
          faceIndex: intersections[0].faceIndex!,
          point: [intersections[0].point.x, intersections[0].point.y, intersections[0].point.z],
          energy: energy!
        });

        if (intersections[0].object.parent instanceof Surface) {
          intersections[0].object.parent.numHits += 1;
        }

        // get the normal direction of the intersection
        const normal = intersections[0].face && intersections[0].face.normal.normalize();

        // find the reflected direction
        const rr =
          normal &&
          intersections[0].face &&
          rd.clone().sub(normal.clone().multiplyScalar(rd.dot(normal.clone())).multiplyScalar(2));

        // calulcate the losses due to reflection
        const reflectionloss =
          energy * abs((intersections[0].object.parent as Surface).reflectionFunction(frequency, angle!));

        // end condition
        if (rr && normal && reflectionloss > 1 / 2 ** 16 && iter < order) {
          // recurse
          return this.traceRay(
            intersections[0].point.clone().addScaledVector(normal.clone(), 0.01),
            rr,
            order,
            reflectionloss,
            source,
            iter + 1,
            chain
          );
        }
      }
      return { chain, chainLength: chain.length, source, intersectedReceiver: false } as RayPath;
    }
  }

  startQuickEstimate(frequencies: number[] = this.defaultFrequencies, numRays: number = 1000) {
    const tempRunningWithoutReceivers = this.runningWithoutReceivers;
    this.runningWithoutReceivers = true;
    let count = 0;
    this.quickEstimateResults = {} as KVP<QuickEstimateStepResult[]>;
    this.sourceIDs.forEach((id) => {
      this.quickEstimateResults[id] = [] as QuickEstimateStepResult[];
    });
    let done = false;
    this.intervals.push(
      setInterval(() => {
        for (let i = 0; i < this.passes; i++, count++) {
          for (let j = 0; j < this.sourceIDs.length; j++) {
            const id = this.sourceIDs[j];
            const source = this.containers[id] as Source;
            this.quickEstimateResults[id].push(this.quickEstimateStep(source, frequencies, numRays));
          }
        }
        if (count >= numRays) {
          done = true;
          this.intervals.forEach((interval) => window.clearInterval(interval));
          this.runningWithoutReceivers = tempRunningWithoutReceivers;
          console.log(this.quickEstimateResults);
        } else {
          console.log(((count / numRays) * 100).toFixed(1) + "%");
        }
      }, this.updateInterval)
    );
  }
  quickEstimateStep(source: Source, frequencies: number[], numRays: number) {
    const soundSpeed = ac.soundSpeed(20);

    const rt60s = Array(frequencies.length).fill(0) as number[];

    // source position
    let position = source.position.clone();

    // random direction
    let direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();

    let angle = 0;

    const intensities = Array(frequencies.length).fill(source.initialIntensity);

    let iter = 0;
    const maxOrder = 1000;

    let doneDecaying = false;

    let distance = 0;

    // attenuation in dB/m
    const airAttenuationdB = ac.airAttenuation(frequencies);

    let lastIntersection = {} as THREE.Intersection;

    while (!doneDecaying && iter < maxOrder) {
      // set the starting position and direction
      this.raycaster.ray.set(position, direction);

      // find the surface that the ray intersects
      const intersections = this.raycaster.intersectObjects(this.intersectableObjects, true);

      // if there was an intersection
      if (intersections.length > 0) {
        // console.log("itx",intersections[0].point)

        // find the incident angle
        angle = direction.clone().multiplyScalar(-1).angleTo(intersections[0].face!.normal);

        distance += intersections[0].distance;

        const surface = intersections[0].object.parent as Surface;

        // for each frequency
        for (let f = 0; f < frequencies.length; f++) {
          const freq = frequencies[f];
          let coefficient = 1;
          if (surface.kind === "surface") {
            coefficient = surface.reflectionFunction(freq, angle);
          }
          intensities[f] *= coefficient;
          // const level = (ac.P2Lp(ac.I2P()) as number) - airAttenuationdB[f];
          const freqDoneDecaying = source.initialIntensity / intensities[f] > 1000000;
          if (freqDoneDecaying) {
            rt60s[f] = distance / soundSpeed;
          }
          doneDecaying = doneDecaying || freqDoneDecaying;

          // intensities[f] = ac.P2I(ac.Lp2P(level));
        }

        if (intersections[0].object.parent instanceof Surface) {
          intersections[0].object.parent.numHits += 1;
        }

        // get the normal direction of the intersection
        const normal = intersections[0].face!.normal.normalize();

        // find the reflected direction
        direction.sub(normal.clone().multiplyScalar(direction.dot(normal)).multiplyScalar(2)).normalize();

        position.copy(intersections[0].point);

        lastIntersection = intersections[0];
      }
      iter += 1;
    }

    (this.stats.numRaysShot.value as number)++;

    return {
      distance,
      rt60s,
      angle,
      direction,
      lastIntersection
    };
  }

  startAllMonteCarlo() {
    this.intervals.push(
      setInterval(() => {
        for (let i = 0; i < this.passes; i++) {
          this.step();
        }
        this.renderer.needsToRender = true;
      }, this.updateInterval)
    );
  }
  step() {
    for (let i = 0; i < this.sourceIDs.length; i++) {
      this.__num_checked_paths += 1;

      // random theta within the sources theta limits
      const theta = 2 * (Math.random() - 0.5) * (this.containers[this.sourceIDs[i]] as Source).theta;

      // random phi within the sources phi limits
      const phi = 2 * Math.random() * (this.containers[this.sourceIDs[i]] as Source).phi;

      // source position
      const position = (this.containers[this.sourceIDs[i]] as Source).position;

      // source rotation
      const rotation = (this.containers[this.sourceIDs[i]] as Source).rotation;

      // random direction
      const direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      // const direction = new THREE.Vector3().setFromSphericalCoords(1, 0, Math.PI);
      direction.applyEuler(rotation);

      // get the path traced by the ray
      const path = this.traceRay(position, direction, this.reflectionOrder, 1.0, this.sourceIDs[i]);

      // if path exists
      if (path) {
        //  ignoring receiver intersections
        if (this._runningWithoutReceivers) {
          // add the first ray onto the buffer
          this.appendRay([position.x, position.y, position.z], path.chain[0].point, path.chain[0].energy || 1.0, path.chain[0].angle);

          // add the rest of the rays onto the buffer
          for (let j = 1; j < path.chain.length; j++) {
            // starting at i=1 to avoid an if statement in here
            this.appendRay(
              // the previous point
              path.chain[j - 1].point,

              // the current point
              path.chain[j].point,

              // the energy content displayed as a color + alpha
              path.chain[j].energy || 1.0,
              path.chain[j].angle
            );
          }

          // get the uuid of the intersected receiver that way we can filter by receiver
          const index = path.chain[path.chain.length - 1].object;

          // if the receiver uuid is already defined, push the path on, else define it
          this.paths[index] ? this.paths[index].push(path) : (this.paths[index] = [path]);

          // increment the sources ray counter
          (this.containers[this.sourceIDs[i]] as Source).numRays += 1;
        }

        //  if we are checking receiver intersections
        else if (path["intersectedReceiver"]) {
          // add the ray to the buffer
          this.appendRay(
            [position.x, position.y, position.z],
            path.chain[0].point,
            path.chain[0].energy || 1.0,
            path.chain[0].angle
          );

          // add the rest of the rays
          for (let i = 1; i < path.chain.length; i++) {
            this.appendRay(
              // the previous point
              path.chain[i - 1].point,

              // the current point
              path.chain[i].point,

              // the energy content displayed as a color + alpha
              path.chain[i].energy || 1.0,
              path.chain[i].angle
            );
          }
          (this.stats.numValidRayPaths.value as number)++;
          this.validRayCount += 1;
          this.renderer.overlays.global.setCellValue(this.uuid + "-valid-ray-count", this.validRayCount);
          const index = path.chain[path.chain.length - 1].object;
          this.paths[index] ? this.paths[index].push(path) : (this.paths[index] = [path]);

          // increment the sources ray counter
          (this.containers[this.sourceIDs[i]] as Source).numRays += 1;
        }
      }

      (this.stats.numRaysShot.value as number)++;
    }

    this.messenger.postMessage("RAYTRACER_RESULTS_SHOULD_UPDATE");
  }
  start() {
    this.mapIntersectableObjects();
    this.__start_time = Date.now();
    this.__num_checked_paths = 0;
    this.startAllMonteCarlo();
  }
  stop() {
    this.__calc_time = Date.now() - this.__start_time;
    this.intervals.forEach((interval) => {
      window.clearInterval(interval);
    });
    this.intervals = [] as NodeJS.Timeout[];
    Object.keys(this.paths).forEach((key) => {
      const calc_time = this.__calc_time / 1000;
      const num_valid_rays = this.paths[key].length;
      const valid_ray_rate = num_valid_rays / calc_time;
      const num_checks = this.__num_checked_paths;
      const check_rate = num_checks / calc_time;
      console.log({
        calc_time,
        num_valid_rays,
        valid_ray_rate,
        num_checks,
        check_rate
      });
      this.paths[key].forEach((p) => {
        this.calculateTotalPathTime(p);
      });
    });
    this.mapIntersectableObjects();
  }
  clearRays() {
    if (this.room) {
      for (let i = 0; i < this.room.surfaces.children.length; i++) {
        (this.room.surfaces.children[i] as Surface).resetHits();
      }
    }
    this.validRayCount = 0;
    this.renderer.overlays.global.setCellValue(this.uuid + "-valid-ray-count", this.validRayCount);
    this.rayBufferGeometry.setDrawRange(0, 1);
    this.rayPositionIndex = 0;
    this.stats.numRaysShot.value = 0;
    this.stats.numValidRayPaths.value = 0;
    this.messenger.postMessage("STATS_UPDATE", this.stats);
    this.sourceIDs.forEach((x) => {
      (this.containers[x] as Source).numRays = 0;
    });
    this.paths = {} as KVP<RayPath[]>;
    this.mapIntersectableObjects();
    this.renderer.needsToRender = true;
  }

  calculateResponse(frequencies: number[] = this.reflectionLossFrequencies) {
    this.paths;
  }
  calculateTotalPathTime(path: RayPath) {
    path.time = 0;
    for (let i = 0; i < path.chain.length; i++) {
      path.time += path.chain[i].distance / 343.2;
    }
    return path;
  }

  calculateWithDiffuse(frequencies: number[] = this.reflectionLossFrequencies) {
    this.allReceiverData = [] as ReceiverData[];
    const keys = Object.keys(this.paths);
    const receiverRadius = (this.containers[this.receiverIDs[0]] as Receiver).scale.x;
    const receiverPosition = (this.containers[this.receiverIDs[0]] as Receiver).position;
    keys.forEach((key) => {
      const receiverData = new ReceiverData(key);
      this.paths[key].forEach((path) => {
        const energytime = {
          time: 0,
          energy: []
        } as EnergyTime;
        let intersectedReceiver = false;
        path.chain.forEach((segment) => {
          const container = this.receiverIDs.includes(segment.object)
            ? this.containers[segment.object]
            : (this.room.surfaceMap[segment.object] as Container);
          if (container && container.kind) {
            if (container.kind === "receiver") {
              intersectedReceiver = true;
            } else if (container.kind === "surface") {
              // hit surface
              const surface = container as Surface;
              const energytime_diffuse = {
                time: segment.time_rec,
                energy: []
              } as EnergyTime;
              frequencies.forEach((frequency, index) => {
                const reflectionloss = abs(surface.reflectionFunction(frequency, segment.angle_in));
                if (!energytime.energy[index]) {
                  energytime.energy[index] = {
                    frequency,
                    value: reflectionloss
                  };
                } else {
                  energytime.energy[index].value *= reflectionloss;
                  energytime.time = segment.total_time;
                  const d = new THREE.Vector3(
                    receiverPosition.x - segment.point[0],
                    receiverPosition.y - segment.point[1],
                    receiverPosition.z - segment.point[2]
                  );
                  const theta = new THREE.Vector3().fromArray(segment.faceNormal).angleTo(d);

                  const r = receiverRadius;
                  energytime_diffuse.energy[index] = {
                    frequency,
                    value: scatteredEnergy(
                      energytime.energy[index].value,
                      surface.absorptionFunction(frequency),
                      0.1,
                      asin(receiverRadius / d.length()),
                      theta
                    )
                  };
                }
              });
              if (energytime_diffuse.energy.length > 0) {
                receiverData.data.push(energytime_diffuse);
              }
            } // end container === "surface"
          } // end container && container.kind
        }); // end path.chain for each
        if (intersectedReceiver) {
          receiverData.data.push(energytime);
        }
      });
      receiverData.data = sort(receiverData.data).asc((x) => x.time);
      this.allReceiverData.push(receiverData);
    });
    const chartdata = this.allReceiverData.map((x) => {
      return frequencies.map((freq) => {
        return {
          label: freq.toString(),
          x: x.data.map((y) => y.time),
          y: x.data.map((y) => y.energy.filter((z) => z.frequency == freq)[0].value)
        };
      });
    });
    this.messenger.postMessage("UPDATE_CHART_DATA", chartdata && chartdata[0]);
    return this.allReceiverData;
  }

  //TODO change this name to something more appropriate
  calculateReflectionLoss(frequencies: number[] = this.reflectionLossFrequencies) {
    // reset the receiver data
    this.allReceiverData = [] as ReceiverData[];

    // helper function
    const dataset = (label, data) => ({ label, data });

    // for the chart
    const chartdata = [] as ChartData[];
    if (frequencies) {
      for (let i = 0; i < frequencies.length; i++) {
        chartdata.push(dataset(frequencies[i].toString(), []));
      }
    }

    // pathkeys.length should equal the number of receivers in the scene
    const pathkeys = Object.keys(this.paths);

    // for each receiver's path in the total path array
    for (let i = 0; i < pathkeys.length; i++) {
      // init contribution array
      this.allReceiverData.push({
        id: pathkeys[i],
        data: [] as EnergyTime[]
      });

      // for each paths chain of intersections
      for (let j = 0; j < this.paths[pathkeys[i]].length; j++) {
        // the individual ray path which holds intersection data
        const raypath = this.paths[pathkeys[i]][j];

        /**
         * calculates the loss due to reflection over the ray's path
         */
        function reflectionLossFunction(frequency: number): number {
          const chain = raypath.chain.slice(0, -1);
          if (chain && chain.length > 0) {
            let magnitude = 1;
            for (let k = 0; k < chain.length; k++) {
              const intersection = chain[k];
              const surface = this.room.surfaceMap[intersection.object] as Surface;
              const angle = intersection["angle"] || 0;
              magnitude = magnitude * abs(surface.reflectionFunction(frequency, angle));
            }
            return magnitude;
          }
          return 1;
        }

        let refloss;
        // if there was a given frequency array
        if (frequencies) {
          // map the frequencies to reflection loss
          refloss = frequencies.map((freq) => ({
            frequency: freq,
            value: reflectionLossFunction(freq)
          }));
          frequencies.forEach((f, i) => {
            chartdata[i].data.push([raypath.time!, reflectionLossFunction(f)]);
          });
        } else {
          // if no frequencies given, just give back the function that calculates the reflection loss
          refloss = reflectionLossFunction;
        }
        this.allReceiverData[this.allReceiverData.length - 1].data.push({
          time: raypath.time!,
          energy: refloss
        });
      }
      this.allReceiverData[this.allReceiverData.length - 1].data = this.allReceiverData[
        this.allReceiverData.length - 1
      ].data.sort((a, b) => a.time - b.time);
    }
    for (let i = 0; i < chartdata.length; i++) {
      chartdata[i].data = chartdata[i].data.sort((a, b) => a[0] - b[0]);
      chartdata[i].x = chartdata[i].data.map((x) => x[0]);
      chartdata[i].y = chartdata[i].data.map((x) => x[1]);
    }
    this.chartdata = chartdata;
    return [this.allReceiverData, chartdata];
  }
  downloadImpulseResponse(index: number = 0, sample_rate: number = 44100) {
    const data = this.saveImpulseResponse(index, sample_rate);
    if (data) {
      const blob = new Blob([data], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, `ir${index}-fs${sample_rate}hz-t${Date.now()}.txt`);
    } else return;
  }
  resampleResponse(index: number = 0, sampleRate: number = 44100) {
    // if response has been calculated
    if (this.allReceiverData && this.allReceiverData[index]) {
      // the receivers temporal data
      const receiverData = this.allReceiverData[index].data;

      // length of the reponse in seconds
      const maxTime = receiverData[receiverData.length - 1].time;

      // number of samples the output array will have
      const numSamples = floor(sampleRate * maxTime);

      // initialize the sampled array
      const sampledArray = [] as number[][];

      // stick it in a for loop
      for (let i = 0, j = 0; i < numSamples; i++) {
        // the time given the current sample and sample rate (in seconds)
        let sampleTime = (i / numSamples) * maxTime;

        // if there exists data
        if (receiverData[j] && receiverData[j].time) {
          // get the actual time of the intersection
          let actualTime = receiverData[j].time;

          // ex. actual time of intersection is at t=3.5s but the sampled time is only at t=3.2s
          if (actualTime > sampleTime) {
            // add a 0.0 for the value at each frequency
            sampledArray.push([sampleTime].concat(Array(receiverData[j].energy.length).fill(0.0)));

            //continue to next iteration
            continue;
          }

          // this will happen when one or more intersections occured in between a sampling period (1/sampleRate)
          if (actualTime <= sampleTime) {
            // sum array initialized to 0 (one for each frequency)
            let sums = receiverData[j].energy.map((x) => 0);

            // counts the number of intersections that occured between samples
            let sub_counter = 0;

            // loop over all the missed intersections
            while (actualTime <= sampleTime) {
              // set the actual time = the current intersections time
              actualTime = receiverData[j].time;

              // sum the value at each frequency
              sums.forEach((x, i, a) => (a[i] += receiverData[j].energy[i].value));

              // increment the receiver data point index;
              j++;

              // increment the sub counter
              sub_counter++;
            } // exit the loop

            // push another row onto the sampled array
            sampledArray.push([sampleTime, ...sums.map((x) => x / sub_counter)]);

            // continue to next iteration
            continue;
          }
        }
      }

      // return the sample array
      return sampledArray;
    }

    // if reponse has not been calculated yet
    else {
      console.warn("no data yet");
    }
  }
  saveImpulseResponse(index: number = 0, sample_rate: number = 44100) {
    const data = this.resampleResponse(index, sample_rate);
    if (data) {
      return data.map((x) => x.join(",")).join("\n");
    }
    return;
  }
  getReceiverIntersectionPoints(id: string) {
    if (this.paths && this.paths[id] && this.paths[id].length > 0) {
      return this.paths[id].map((x) =>
        new THREE.Vector3().fromArray(x.chain[x.chain.length - 1].point)
      ) as THREE.Vector3[];
    } else return [] as THREE.Vector3[];
  }
  calculateResponseByIntensity(freqs: number[] = this.defaultFrequencies, temperature: number = 20) {
    const paths = this.indexedPaths;

    // sound speed in m/s
    const soundSpeed = ac.soundSpeed(temperature);

    // attenuation in dB/m
    const airAttenuationdB = ac.airAttenuation(freqs);

    this.responseByIntensity = {} as KVP<KVP<ResponseByIntensity>>;

    // for each receiver
    for (const receiverKey in paths) {
      this.responseByIntensity[receiverKey] = {} as KVP<ResponseByIntensity>;

      // for each source
      for (const sourceKey in paths[receiverKey]) {
        this.responseByIntensity[receiverKey][sourceKey] = {
          freqs,
          response: [] as RayPathResult[]
        };

        // source total intensity
        const Itotal = ac.P2I(ac.Lp2P((this.containers[sourceKey] as Source).initialSPL)) as number;

        // for each path
        for (let i = 0; i < paths[receiverKey][sourceKey].length; i++) {
          // propogagtion time
          let time = 0;

          // ray initial intensity
          const Iray = Itotal / (this.containers[sourceKey] as Source).numRays;

          // intensity at each frequency
          const IrayArray = Array(freqs.length).fill(Iray);

          // for each intersection
          for (let j = 0; j < paths[receiverKey][sourceKey][i].chain.length; j++) {
            // intersected angle wrt normal, and the distance traveled
            const { angle, distance } = paths[receiverKey][sourceKey][i].chain[j];

            time += distance / soundSpeed;

            // the intersected surface
            // const surface = paths[receiverKey][sourceKey][i].chain[j].object.parent as Surface;
            const id = paths[receiverKey][sourceKey][i].chain[j].object;

            const surface = this.containers[id] || this.room.surfaceMap[id] || null;

            // for each frequency
            for (let f = 0; f < freqs.length; f++) {
              const freq = freqs[f];
              let coefficient = 1;
              if (surface && surface.kind === "surface") {
                // coefficient = surface.reflectionFunction(freq, angle);
                coefficient = 1 - (surface as Surface).absorptionFunction(freq);
              }
              IrayArray[f] = ac.P2I(
                ac.Lp2P((ac.P2Lp(ac.I2P(IrayArray[f] * coefficient)) as number) - airAttenuationdB[f] * distance)
              ) as number;
            }
          }
          const level = ac.P2Lp(ac.I2P(IrayArray)) as number[];
          this.responseByIntensity[receiverKey][sourceKey].response.push({
            time,
            level,
            bounces: paths[receiverKey][sourceKey][i].chain.length
          });
        }
        this.responseByIntensity[receiverKey][sourceKey].response.sort((a, b) => a.time - b.time);
      }
    }

    return this.resampleResponseByIntensity();
  }

  resampleResponseByIntensity(sampleRate: number = this.intensitySampleRate) {
    if (this.responseByIntensity) {
      for (const recKey in this.responseByIntensity) {
        for (const srcKey in this.responseByIntensity[recKey]) {
          const { response, freqs } = this.responseByIntensity[recKey][srcKey];
          const maxTime = response[response.length - 1].time;
          const numSamples = floor(sampleRate * maxTime);
          this.responseByIntensity[recKey][srcKey].resampledResponse = Array(freqs.length)
            .fill(0)
            .map((x) => new Float32Array(numSamples)) as Array<Float32Array>;

          this.responseByIntensity[recKey][srcKey].sampleRate = sampleRate;
          let sampleArrayIndex = 0;
          let zeroIndices = [] as number[];
          let lastNonZeroPoint = freqs.map((x) => 0);
          let seenFirstPointYet = false;
          for (let i = 0, j = 0; i < numSamples; i++) {
            let sampleTime = (i / numSamples) * maxTime;
            if (response[j] && response[j].time) {
              let actualTime = response[j].time;
              if (actualTime > sampleTime) {
                for (let f = 0; f < freqs.length; f++) {
                  this.responseByIntensity[recKey][srcKey].resampledResponse![f][sampleArrayIndex] = 0.0;
                }
                if (seenFirstPointYet) {
                  zeroIndices.push(sampleArrayIndex);
                }
                sampleArrayIndex++;
                continue;
              }
              if (actualTime <= sampleTime) {
                let sums = response[j].level.map((x) => 0);
                while (actualTime <= sampleTime) {
                  actualTime = response[j].time;
                  for (let k = 0; k < freqs.length; k++) {
                    sums[k] = ac.db_add([sums[k], response[j].level[k]]);
                  }
                  j++;
                }
                for (let f = 0; f < freqs.length; f++) {
                  this.responseByIntensity[recKey][srcKey].resampledResponse![f][sampleArrayIndex] = sums[f];
                  if (zeroIndices.length > 0) {
                    const dt = 1 / sampleRate;
                    const lastValue = lastNonZeroPoint[f];
                    const nextValue = sums[f];
                    for (let z = 0; z < zeroIndices.length; z++) {
                      const value = lerp(lastValue, nextValue, (z + 1) / (zeroIndices.length + 1));
                      this.responseByIntensity[recKey][srcKey].resampledResponse![f][zeroIndices[z]] = value;
                    }
                  }
                  lastNonZeroPoint[f] = sums[f];
                }
                if (zeroIndices.length > 0) {
                  zeroIndices = [] as number[];
                }

                seenFirstPointYet = true;
                sampleArrayIndex++;
                continue;
              }
            }
          }
          this.calculateT20(recKey, srcKey);
          this.calculateT30(recKey, srcKey);
          this.calculateT60(recKey, srcKey);
        }
      }

      // return the sample array
      return this.responseByIntensity;
    }

    // if reponse has not been calculated yet
    else {
      console.warn("no data yet");
    }
  }

  hidePlot() {
    if (!this.responseOverlayElement.classList.contains("response_overlay-hidden")) {
      this.responseOverlayElement.classList.add("response_overlay-hidden");
    }
    this.renderer.stats.unhide();
    this.renderer.orientationControl.show();
  }
  showPlot() {
    if (this.responseOverlayElement.classList.contains("response_overlay-hidden")) {
      this.responseOverlayElement.classList.remove("response_overlay-hidden");
    }
    this.renderer.stats.hide();
    this.renderer.orientationControl.hide();
  }

  plotResponseByIntensity(receiverId?: string, sourceId?: string) {
    this.showPlot();
    const reckeys = this.receiverIDs;
    const srckeys = this.sourceIDs;
    if (reckeys.length > 0 && srckeys.length > 0) {
      const recid = receiverId || reckeys[0];
      const srcid = sourceId || srckeys[0];
      const resampledResponse = this.responseByIntensity[recid][srcid].resampledResponse;
      const sampleRate = this.responseByIntensity[recid][srcid].sampleRate;
      const freqs = this.responseByIntensity[recid][srcid].freqs;

      if (resampledResponse && sampleRate) {
        const resampleTime = new Float32Array(resampledResponse[0].length);
        for (let i = 0; i < resampledResponse[0].length; i++) {
          resampleTime[i] = i / sampleRate;
        }
        this.plotData = freqs.map((freq, i) => {
          return {
            x: resampleTime,
            y: resampledResponse[i],
            mode: this.plotStyle.mode,
            name: freq.toString() + " Hz",
            line: {
              width: 1
            }
          } as Partial<Plotly.PlotData>;
        });

        const layout = {
          title: `<b>${this.containers[recid].name}</b> from <b>${this.containers[srcid].name}</b>`
        };

        if (this.responseOverlayElement.childElementCount > 0) {
          const xs = [] as Float32Array[];
          const ys = [] as Float32Array[];
          const is = [] as number[];
          this.plotData.forEach((x, i) => {
            xs.push(x.x as Float32Array);
            ys.push(x.y as Float32Array);
            is.push(i);
          });
          //@ts-ignore
          Plotly.update(this.responseOverlayElement.id, { x: xs, y: ys }, is);

          // Plotly.extendTraces(this.responseOverlayElement.id, { x: xs, y: ys }, is);
        } else {
          Plotly.newPlot(this.responseOverlayElement.id, this.plotData, layout, { responsive: true });
          const { responseOverlayElement } = this;
          const traverseFunction = reverseTraverse((elt) => elt && elt.classList.contains("splitter-layout"));
          const splitterLayout = traverseFunction(this.responseOverlayElement);
          console.log(splitterLayout);
          if (splitterLayout) {
            const splitter = splitterLayout.querySelector(".layout-splitter");
            if (splitter) {
              (splitter as HTMLDivElement).addEventListener("mouseup", (e) => {
                Plotly.Plots.resize(responseOverlayElement);
              });
            }
          }
        }
      }
    }
  }

  updatePlotStyle(plotStyle: Partial<PlotData>) {
    Object.assign(this.plotStyle, plotStyle);
    if (this.responseOverlayElement.childElementCount > 0) {
      Plotly.restyle(this.responseOverlayElement, this.plotStyle);
    }
  }

  calculateT30(receiverId?: string, sourceId?: string) {
    const reckeys = this.receiverIDs;
    const srckeys = this.sourceIDs;
    if (reckeys.length > 0 && srckeys.length > 0) {
      const recid = receiverId || reckeys[0];
      const srcid = sourceId || srckeys[0];
      const resampledResponse = this.responseByIntensity[recid][srcid].resampledResponse;
      const sampleRate = this.responseByIntensity[recid][srcid].sampleRate;
      const freqs = this.responseByIntensity[recid][srcid].freqs;

      if (resampledResponse && sampleRate) {
        const resampleTime = new Float32Array(resampledResponse[0].length);
        for (let i = 0; i < resampledResponse[0].length; i++) {
          resampleTime[i] = i / sampleRate;
        }

        this.responseByIntensity[recid][srcid].t30 = resampledResponse.map((resp) => {
          let i = 0;
          let val = resp[i];
          while (val == 0) {
            val = resp[i++];
          }
          for (let j = i; j >= 0; j--) {
            resp[j] = val;
          }
          const cutoffLevel = val - 30;
          const avg = movingAverage(resp, 2).filter((x) => x >= cutoffLevel);
          const len = avg.length;

          return linearRegression(resampleTime.slice(0, len), resp.slice(0, len));
        });
      }
    }
    return this.responseByIntensity;
  }
  calculateT20(receiverId?: string, sourceId?: string) {
    const reckeys = this.receiverIDs;
    const srckeys = this.sourceIDs;
    if (reckeys.length > 0 && srckeys.length > 0) {
      const recid = receiverId || reckeys[0];
      const srcid = sourceId || srckeys[0];
      const resampledResponse = this.responseByIntensity[recid][srcid].resampledResponse;
      const sampleRate = this.responseByIntensity[recid][srcid].sampleRate;
      const freqs = this.responseByIntensity[recid][srcid].freqs;

      if (resampledResponse && sampleRate) {
        const resampleTime = new Float32Array(resampledResponse[0].length);
        for (let i = 0; i < resampledResponse[0].length; i++) {
          resampleTime[i] = i / sampleRate;
        }

        this.responseByIntensity[recid][srcid].t20 = resampledResponse.map((resp) => {
          let i = 0;
          let val = resp[i];
          while (val == 0) {
            val = resp[i++];
          }
          for (let j = i; j >= 0; j--) {
            resp[j] = val;
          }
          const cutoffLevel = val - 20;
          const avg = movingAverage(resp, 2).filter((x) => x >= cutoffLevel);
          const len = avg.length;

          return linearRegression(resampleTime.slice(0, len), resp.slice(0, len));
        });
      }
    }
    return this.responseByIntensity;
  }
  calculateT60(receiverId?: string, sourceId?: string) {
    const reckeys = this.receiverIDs;
    const srckeys = this.sourceIDs;
    if (reckeys.length > 0 && srckeys.length > 0) {
      const recid = receiverId || reckeys[0];
      const srcid = sourceId || srckeys[0];
      const resampledResponse = this.responseByIntensity[recid][srcid].resampledResponse;
      const sampleRate = this.responseByIntensity[recid][srcid].sampleRate;
      const freqs = this.responseByIntensity[recid][srcid].freqs;

      if (resampledResponse && sampleRate) {
        const resampleTime = new Float32Array(resampledResponse[0].length);
        for (let i = 0; i < resampledResponse[0].length; i++) {
          resampleTime[i] = i / sampleRate;
        }

        this.responseByIntensity[recid][srcid].t60 = resampledResponse.map((resp) => {
          let i = 0;
          let val = resp[i];
          while (val == 0) {
            val = resp[i++];
          }
          for (let j = i; j >= 0; j--) {
            resp[j] = val;
          }
          const cutoffLevel = val - 60;
          const avg = movingAverage(resp, 2).filter((x) => x >= cutoffLevel);
          const len = avg.length;

          return linearRegression(resampleTime.slice(0, len), resp.slice(0, len));
        });
      }
    }
    return this.responseByIntensity;
  }

  computeImageSources(source, previousReflector, maxOrder) {
    //     for each surface in geometry do
    //         if (not previousReflector) or
    //         ((inFrontOf(surface, previousReflector)) and (surface.normal dot previousReflector.normal < 0))
    //             newSource = reflect(source, surface)
    //             sources[nofSources++] = newSource
    //             if (maxOrder > 0)
    //                 computeImageSources(newSource, surface, maxOrder - 1)

    const surfaces = this.room.surfaces.children;
  }
  onParameterConfigFocus() {
    console.log("focus");
    console.log(this.renderer.overlays.global.cells);
    this.renderer.overlays.global.showCell(this.uuid + "-valid-ray-count");
  }
  onParameterConfigBlur() {
    console.log("blur");
    this.renderer.overlays.global.hideCell(this.uuid + "-valid-ray-count");
  }
  
  pathsToLinearBuffer() {
    const uuidToLinearBuffer = uuid => uuid.split('').map(x => x.charCodeAt(0));
    const chainArrayToLinearBuffer = (chainArray) => {
      return chainArray.map((chain: Chain) => [
          ...uuidToLinearBuffer(chain.object), // 36x8
          chain.angle, // 1x32
          chain.distance, // 1x32
          chain.energy, // 1x32
          chain.faceIndex, // 1x8
          chain.faceMaterialIndex, // 1x8
          ...chain.faceNormal, // 3x32
          ...chain.point // 3x32
        ]).flat();
    };
    const pathOrder = [
      "source",
      "chainLength",
      "time",
      "intersectedReceiver",
      "energy",
      "chain"
    ];
    const chainOrder = [
      "object",
      "angle",
      "distance",
      "energy",
      "faceIndex",
      "faceMaterialIndex",
      "faceNormal",
      "point"
    ];
    
    const buffer = new Float32Array(Object.keys(this.paths).map(key => {
      const pathBuffer = this.paths[key].map(path => {
        return [
          ...uuidToLinearBuffer(path.source),
          path.chainLength,
          path.time,
          Number(path.intersectedReceiver),
          path.energy,
          ...chainArrayToLinearBuffer(path.chain)
        ];
      }).flat();
      return [
        ...uuidToLinearBuffer(key),
        pathBuffer.length,
        ...pathBuffer
      ]
    }).flat());
    return buffer;
  }
  
  linearBufferToPaths(linearBuffer: Float32Array) {
    const uuidLength = 36;
    const chainItemLength = 47;
    const decodeUUID = (buffer) => String.fromCharCode(...buffer);
    const decodeChainItem = (chainItem: Float32Array) => {
      let o = 0;
      const object = decodeUUID(chainItem.slice(o, o += uuidLength));
      const angle = chainItem[o++];
      const distance = chainItem[o++];
      const energy = chainItem[o++];
      const faceIndex = chainItem[o++];
      const faceMaterialIndex = chainItem[o++];
      const faceNormal = [chainItem[o++], chainItem[o++], chainItem[o++]];
      const point = [chainItem[o++], chainItem[o++], chainItem[o++]];
      return {
        object,
        angle,
        distance,
        energy,
        faceIndex,
        faceMaterialIndex,
        faceNormal,
        point
      } as Chain;
    };
    const decodePathBuffer = buffer => {
      const paths = [] as RayPath[];
      let o = 0;
      while (o < buffer.length) {
        const source = decodeUUID(buffer.slice(o, o += uuidLength));
        const chainLength = buffer[o++];
        const time = buffer[o++];
        const intersectedReceiver = Boolean(buffer[o++]);
        const energy = buffer[o++];
        const chain = [] as Chain[];
        for (let i = 0; i < chainLength; i++) {
          chain.push(decodeChainItem(buffer.slice(o, o += chainItemLength)));
        }
        paths.push({
          source,
          chainLength,
          time,
          intersectedReceiver,
          energy,
          chain
        });
      }
      return paths as RayPath[];
    };
    let offset = 0;
    const pathsObj = {} as KVP<RayPath[]>;
    while (offset < linearBuffer.length) {
      const uuid = decodeUUID(linearBuffer.slice(offset, offset += uuidLength));
      const pathBufferLength = linearBuffer[offset++];
      const paths = decodePathBuffer(linearBuffer.slice(offset, offset += pathBufferLength));
      pathsObj[uuid] = paths;
    }
    return pathsObj;
  }
  
  
  
  get sources() {
    if (this.sourceIDs.length > 0) {
      return this.sourceIDs.map((x) => this.containers[x]);
    } else {
      return [];
    }
  }
  get receivers() {
    if (this.receiverIDs.length > 0 && Object.keys(this.containers).length > 0) {
      return this.receiverIDs.map((x) => (this.containers[x] as Receiver).mesh) as THREE.Mesh[];
    } else return [];
  }
  get room(): Room {
    return this.containers[this.roomID] as Room;
  }
  get precheck() {
    return this.sourceIDs.length > 0 && typeof this.room !== "undefined";
  }
  get indexedPaths() {
    const paths = {} as KVP<KVP<RayPath[]>>;
    for (const receiverKey in this.paths) {
      paths[receiverKey] = {} as KVP<RayPath[]>;
      for (let i = 0; i < this.paths[receiverKey].length; i++) {
        const sourceKey = this.paths[receiverKey][i].source;
        if (!paths[receiverKey][sourceKey]) {
          paths[receiverKey][sourceKey] = [this.paths[receiverKey][i]] as RayPath[];
        } else {
          paths[receiverKey][sourceKey].push(this.paths[receiverKey][i]);
        }
      }
    }
    return paths;
  }

  get isRunning() {
    return this.running;
  }
  set isRunning(isRunning: boolean) {
    this.running = this.precheck && isRunning;
    if (this.running) {
      this.start();
    } else {
      this.stop();
    }
  }

  get raysVisible() {
    return this._raysVisible;
  }
  set raysVisible(visible: boolean) {
    if (visible != this._raysVisible) {
      this._raysVisible = visible;
      this.rays.visible = visible;
    }
    this.renderer.needsToRender = true;
  }

  get pointsVisible() {
    return this._pointsVisible;
  }
  set pointsVisible(visible: boolean) {
    if (visible != this._pointsVisible) {
      this._pointsVisible = visible;
      this.hits.visible = visible;
    }
    this.renderer.needsToRender = true;
  }

  get invertedDrawStyle() {
    return this._invertedDrawStyle;
  }
  set invertedDrawStyle(inverted: boolean) {
    if (this._invertedDrawStyle != inverted) {
      this._invertedDrawStyle = inverted;
      (this.hits.material as THREE.ShaderMaterial).uniforms["inverted"].value = Number(inverted);
      (this.hits.material as THREE.ShaderMaterial).needsUpdate = true;
    }
    this.renderer.needsToRender = true;
  }

  get pointSize() {
    return this._pointSize;
  }

  set pointSize(size: number) {
    if (Number.isFinite(size) && size > 0) {
      this._pointSize = size;
      (this.hits.material as THREE.ShaderMaterial).uniforms["pointScale"].value = this._pointSize;
      (this.hits.material as THREE.ShaderMaterial).needsUpdate = true;
    }
    this.renderer.needsToRender = true;
  }

  get runningWithoutReceivers() {
    return this._runningWithoutReceivers;
  }

  set runningWithoutReceivers(runningWithoutReceivers: boolean) {
    this.mapIntersectableObjects();
    this._runningWithoutReceivers = runningWithoutReceivers;
  }

  // testWasm(value: number) {
  //   async function loadWasm() {
  //     return await loader.instantiate(fetch("wasm/index.wasm"), {
  //       index: {
  //         consoleLog: (value) => console.log(value)
  //       }
  //     });
  //   }

  //   loadWasm()
  //     .then((wasm) => {
  //       console.log(wasm);
  //       const result = wasm["testFunction"](value);
  //       console.log(result);
  //     })
  //     .catch(console.error);
  // }
}

export default RayTracer;
