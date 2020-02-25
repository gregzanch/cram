import Solver from "../solver";
import * as THREE from "three";
import Room from "../../objects/room";
import { KeyValuePair } from "../../common/key-value-pair";
import Container from "../../objects/container";
import enumerable from "../../common/enumerable";
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from "three-mesh-bvh";
import Source from "../../objects/source";
import Renderer from "../../render/renderer";
import Surface from "../../objects/surface";
import Receiver from "../../objects/receiver";
import { Stat } from "../../components/Gutter/Stats";
import Messenger from "../../messenger";
import sort from "fast-sort";
// import * as ac from '../acoustics'
import FileSaver from "file-saver";
import { scatteredEnergy } from "./scattered-energy";
import PointShader from "./shaders/points";
//@ts-ignore
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
//@ts-ignore
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;
export interface Chain {
  angle_in: number;
  angle_out: number;
  total_time: number;
  time_rec: number;
  angle_rec: number;
  distance: number;
  point: THREE.Vector3;
  object: THREE.Object3D;
  face: THREE.Face3;
  faceIndex: number;
}
const { abs, floor, asin } = Math;
export interface RayPath {
  intersectedReceiver: boolean;
  chain: Chain[];
  energy: number;
  time?: number;
}
export interface EnergyTime {
  time: number;
  energy: {
    frequency: number;
    value: number;
  }[];
}
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
  name?: string;
  roomID?: string;
  sourceIDs?: string[];
  surfaceIDs?: string[];
  containers?: KeyValuePair<Container>;
  receiverIDs?: string[];
  updateInterval?: number;
  reflectionOrder?: number;
  _isRunning?: boolean;
  messenger: Messenger;
  runWithoutReceiver?: boolean;
}
export const defaults = {
  name: "ray-tracer",
  roomID: "",
  sourceIDs: [] as string[],
  surfaceIDs: [] as string[],
  containers: {} as KeyValuePair<Container>,
  receiverIDs: [] as string[],
  updateInterval: 20,
  reflectionOrder: 200,
  _isRunning: false,
  runWithoutReceiver: true
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
export default class RayTracer extends Solver {
  roomID: string;
  sourceIDs: string[];
  containers: KeyValuePair<Container | Room>;
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
  paths: KeyValuePair<RayPath[]>;
  stats: KeyValuePair<Stat>;
  messenger: Messenger;
  statsUpdatePeriod: number;
  lastTime: number;
  runWithoutReceiver: boolean;
  reflectionLossFrequencies: number[];
  allReceiverData!: ReceiverData[];
  hits: THREE.Points;
  pointScale: number;
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
    this.runWithoutReceiver = params.runWithoutReceiver || defaults.runWithoutReceiver;
    this.renderer = params.renderer;
    this.reflectionLossFrequencies = [4000];
    this.intervals = [];
    this.lastTime = Date.now();
    this.statsUpdatePeriod = 100;
    this.pointScale = 5;
    this.raycaster = new THREE.Raycaster();
    this.rayBufferGeometry = new THREE.BufferGeometry();
    this.maxrays = 1e6 - 1;
    this.rayBufferAttribute = new THREE.Float32BufferAttribute(new Float32Array(this.maxrays), 3);
    this.rayBufferAttribute.setUsage(THREE.DynamicDrawUsage);
    this.rayBufferGeometry.setAttribute("position", this.rayBufferAttribute);
    this.rayBufferGeometry.setDrawRange(0, this.maxrays);
    this.colorBufferAttribute = new THREE.Float32BufferAttribute(new Float32Array(this.maxrays), 2);
    this.colorBufferAttribute.setUsage(THREE.DynamicDrawUsage);
    this.rayBufferGeometry.setAttribute("color", this.colorBufferAttribute);
    this.rays = new THREE.LineSegments(
      this.rayBufferGeometry,
      new THREE.LineBasicMaterial({
        color: 0x282929,
        transparent: true,
        opacity: 0.2,
        premultipliedAlpha: true,
        blending: THREE.NormalBlending

        // depthTest: false
      })
    );
    this.rays.frustumCulled = false;
    this.renderer.scene.add(this.rays);
    var shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: PointShader.vs,
      fragmentShader: PointShader.fs,
      transparent: true,
      premultipliedAlpha: true,
      uniforms: {
        drawStyle: { value: DRAWSTYLE.ENERGY },
        pointScale: { value: this.pointScale }
      },
      blending: THREE.NormalBlending
    });
    var pointsMaterial = new THREE.PointsMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.2,
      premultipliedAlpha: true,
      blending: THREE.NormalBlending
    });
    this.hits = new THREE.Points(this.rayBufferGeometry, shaderMaterial);
    this.hits.frustumCulled = false;
    this.renderer.scene.add(this.hits);
    this.rayPositionIndex = 0;
    Object.defineProperty(this.raycaster, "firstHitOnly", {
      value: true,
      writable: true
    });

    // raycaster.intersectObjects([mesh]);
    this.intersections = [] as THREE.Intersection[];
    this.findIDs();
    this.intersectableObjects = this.mapIntersectableObjects();
    this.paths = {} as KeyValuePair<RayPath[]>;
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
    this.messenger = params.messenger;
    this.messenger.postMessage("STATS_SETUP", this.stats);
    this.messenger.addMessageHandler("RAYTRACER_SOURCE_CHANGE", (acc, ...args) => {
      if (args && args[0] && args[0] instanceof Array) {
        this.sourceIDs = args[0].map(x => x.id);
      }
    });
    this.messenger.addMessageHandler("RAYTRACER_RECEIVER_CHANGE", (acc, ...args) => {
      if (args && args[0] && args[0] instanceof Array) {
        this.receiverIDs = args[0].map(x => x.id);
      }
    });
    this.messenger.addMessageHandler("SHOULD_REMOVE_CONTAINER", (acc, ...args) => {
      const id = args[0];
      if (id) {
        console.log(id);
        if (this.sourceIDs.includes(id)) {
          this.sourceIDs = this.sourceIDs.filter(x => x != id);
        }
        else if (this.receiverIDs.includes(id)) {
          this.receiverIDs = this.receiverIDs.filter(x => x != id);
        }
      }
    })
    this.step = this.step.bind(this);
  }
  update = () => {};
  get sources() {
    if (this.sourceIDs.length > 0) {
      return this.sourceIDs.map(x => this.containers[x]);
    }
    else {
      return [];
    }
  }
  get receivers() {
    if (this.receiverIDs.length > 0) {
      return this.receiverIDs.map(x => (this.containers[x] as Receiver).mesh) as THREE.Mesh[];
    }
    else return [];
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
    return this.room.surfaces.children.map((x: Surface) => x.mesh).concat(this.receivers);
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
    } else {
      this.stop();
    }
  }
  setDrawStyle(drawStyle: number) {
    (this.hits.material as THREE.ShaderMaterial).uniforms["drawStyle"].value = drawStyle;
    (this.hits.material as THREE.ShaderMaterial).needsUpdate = true;
  }
  setPointScale(scale: number) {
    this.pointScale = scale;
    (this.hits.material as THREE.ShaderMaterial).uniforms["pointScale"].value = this.pointScale;
    (this.hits.material as THREE.ShaderMaterial).needsUpdate = true;
  }
  clearRays() {
    this.rayBufferGeometry.setDrawRange(0, 1);
    this.rayPositionIndex = 0;
    this.stats.numRaysShot.value = 0;
    this.stats.numValidRayPaths.value = 0;
    this.renderer.messenger.postMessage("STATS_UPDATE", this.stats);
    this.sourceIDs.forEach(x => {
      (this.containers[x] as Source).numRays = 0;
    });
  }
  appendRay(p1: THREE.Vector3, p2: THREE.Vector3, energy: number = 1.0, angle: number = 1.0) {

    // set p1
    this.rayBufferAttribute.setXYZ(this.rayPositionIndex++, p1.x, p1.y, p1.z);

    // set the color
    this.colorBufferAttribute.setXY(this.rayPositionIndex, energy, angle);

    // set p2
    this.rayBufferAttribute.setXYZ(this.rayPositionIndex++, p2.x, p2.y, p2.z);

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
  traceRay(ro: THREE.Vector3, rd: THREE.Vector3, order: number, energy: number, iter: number = 1, chain: THREE.Intersection[] = [], frequency = 4000) {

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
        const angle =
          intersections[0].face &&
          rd
            .clone()
            .multiplyScalar(-1)
            .angleTo(intersections[0].face.normal);

        // push the intersection data onto the chain
        chain.push({
          energy,
          angle,
          ...intersections[0]
        } as THREE.Intersection);

        // end the chain here
        return {
          chain,
          intersectedReceiver: true,
          energy
        } as RayPath;
      } else {

        // find the incident angle
        const angle =
          intersections[0].face &&
          rd
            .clone()
            .multiplyScalar(-1)
            .angleTo(intersections[0].face.normal);

        // push the intersection onto the chain
        chain.push({
          energy,
          angle,
          ...intersections[0]
        } as THREE.Intersection);

        // get the normal direction of the intersection
        const normal = intersections[0].face && intersections[0].face.normal.normalize();

        // find the reflected direction
        const rr =
          normal &&
          intersections[0].face &&
          rd.clone().sub(
            normal
              .clone()
              .multiplyScalar(rd.dot(normal.clone()))
              .multiplyScalar(2)
          );

        // calulcate the losses due to reflection
        const reflectionloss = energy * abs((intersections[0].object.parent as Surface).reflectionFunction(frequency, angle!));

        // end condition
        if (rr && normal && reflectionloss > 1 / 2 ** 16 && iter < order) {

          // recurse
          return this.traceRay(intersections[0].point.clone().addScaledVector(normal.clone(), 0.01), rr, order, reflectionloss, iter + 1, chain);
        }
      }
      return { chain, intersectedReceiver: false } as RayPath;
    }
  }
  startAllMonteCarlo() {
    this.intervals.push(setInterval(this.step, this.updateInterval));
  }
  step() {
    for (let i = 0; i < this.sourceIDs.length; i++) {
      const t = (Math.random() - 0.5) * (this.containers[this.sourceIDs[i]] as Source).theta;
      const p = (Math.random() - 0.5) * (this.containers[this.sourceIDs[i]] as Source).phi;

      // starting position
      const position = (this.containers[this.sourceIDs[i]] as Source).position;

      // random direction
      const direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);

      // get the path traced by the ray
      const path = this.traceRay(position, direction, this.reflectionOrder, 1.0);

      // if path exists
      if (path) {

        //  ignoring receiver intersections
        if (this.runWithoutReceiver) {

          // add the first ray onto the buffer
          this.appendRay(position, (path.chain[0] as THREE.Intersection).point, path.chain[0].energy || 1.0, path.chain[0].angle);

          // add the rest of the rays onto the buffer
          for (let i = 1; i < path.chain.length; i++) {

            // starting at i=1 to avoid an if statement in here
            this.appendRay(

              // the previous point
              (path.chain[i - 1] as THREE.Intersection).point,

              // the current point
              (path.chain[i] as THREE.Intersection).point,

              // the energy content displayed as a color + alpha
              path.chain[i].energy || 1.0,
              path.chain[i].angle
            );
          }

          // get the uuid of the intersected receiver that way we can filter by receiver
          const index = ((path.chain[path.chain.length - 1] as THREE.Intersection).object.parent as Receiver).uuid;

          // if the receiver uuid is already defined, push the path on, else define it
          this.paths[index] ? this.paths[index].push(path) : (this.paths[index] = [path]);
        }

        //  if we are checking receiver intersections
        else if (path["intersectedReceiver"]) {

          // add the ray to the buffer
          this.appendRay(position, (path.chain[0] as THREE.Intersection).point, path.chain[0].energy || 1.0, path.chain[0].angle);

          // add the rest of the rays
          for (let i = 1; i < path.chain.length; i++) {
            this.appendRay(

              // the previous point
              (path.chain[i - 1] as THREE.Intersection).point,

              // the current point
              (path.chain[i] as THREE.Intersection).point,

              // the energy content displayed as a color + alpha
              path.chain[i].energy || 1.0,
              path.chain[i].angle
            );
          }
          (this.stats.numValidRayPaths.value as number)++;
          const index = ((path.chain[path.chain.length - 1] as THREE.Intersection).object as Receiver).uuid;
          this.paths[index] ? this.paths[index].push(path) : (this.paths[index] = [path]);
        }
      }
      (this.stats.numRaysShot.value as number)++;
    }

    // const t = Date.now();

    // if (t - this.lastTime >= this.statsUpdatePeriod) {

    // this.messenger.postMessage("STATS_UPDATE", this.stats);

    // this.lastTime = t;

    // }
  }
  start() {

    // this.raycaster.ray.origin = this.sources[0].position;

    // this.raycaster.ray.direction = new THREE.Vector3(Math.random(), Math.random(), Math.random());

    // this.intersections = [] as THREE.Intersection[];

    // this.raycaster.intersectObjects([this.surfaces], true, this.intersections);
    this.startAllMonteCarlo();
  }
  stop() {
    this.intervals.forEach(interval => {

      // console.log(this.intervals[key]);
      window.clearInterval(interval);
    });
    Object.keys(this.paths).forEach(key => {
      this.paths[key].forEach(p => {
        this.calculateTotalPathTime(p);
      });
    });

    // console.log(this.paths);
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
    keys.forEach(key => {
      const receiverData = new ReceiverData(key);
      this.paths[key].forEach(path => {
        const energytime = {
          time: 0,
          energy: []
        } as EnergyTime;
        let intersectedReceiver = false;
        path.chain.forEach(segment => {
          const container = segment.object.parent as Container;
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
                  const d = new THREE.Vector3().subVectors(receiverPosition, segment.point);
                  const theta = segment.face.normal.angleTo(d);
                  const r = receiverRadius;
                  energytime_diffuse.energy[index] = {
                    frequency,
                    value: scatteredEnergy(energytime.energy[index].value, surface.absorptionFunction(frequency), 0.1, asin(receiverRadius / d.length()), theta)
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
      receiverData.data = sort(receiverData.data).asc(x => x.time);
      this.allReceiverData.push(receiverData);
    });
    const chartdata = this.allReceiverData.map(x => {
      return frequencies.map(freq => {
        return {
          label: freq.toString(),
          x: x.data.map(y => y.time),
          y: x.data.map(y => y.energy.filter(z => z.frequency == freq)[0].value)
        };
      });
    });
    this.messenger.postMessage("UPDATE_CHART_DATA", chartdata && chartdata[0]);
    return this.allReceiverData;
  }
  calculateReflectionLoss(frequencies: number[] = this.reflectionLossFrequencies) {
    this.allReceiverData = [] as ReceiverData[];
    type chartdataset = {
      label: string;
      data: number[][];
      x?: number[];
      y?: number[];
    };

    // helper function
    const dataset = (label, data) => ({ label, data });

    // for the ir chart
    const chartdata = [] as chartdataset[];
    if (frequencies) {
      for (let i = 0; i < frequencies.length; i++) {
        chartdata.push(dataset(frequencies[i].toString(), []));
      }
    }
    const pathkeys = Object.keys(this.paths);

    // pathkeys.length should equal the number of sources in the scene

    // for each source's path in the total path array
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

        // calculates the reflection loss at a specific frequency
        function reflectionLossFunction(frequency: number): number {

          // chain needs to have last item popped i dont remember why
          const chain = raypath.chain.slice(0, -1);

          // if the chain array has members
          if (chain && chain.length > 0) {

            // the initial magnitude
            let magnitude = 1;

            // for each intersection
            for (let k = 0; k < chain.length; k++) {

              // the intersection
              const intersection = chain[k] as THREE.Intersection;

              // the surface where the interscetion took place
              const surface = intersection.object.parent as Surface;

              // the angle of incidencce. needed to calculate the transfer function
              const angle = intersection["angle"] || 0;

              // accumulate transfer functions of the intersected surface
              magnitude = magnitude * abs(surface.reflectionFunction(frequency, angle));
            }
            return magnitude;
          }

          // if chain has a length of 0... which shouldn't happen
          else {
            console.log(raypath);
            return 1;
          }
        }
        let refloss;

        // if there was a given frequency array
        if (frequencies) {

          // map the frequencies to reflection loss
          refloss = frequencies.map(freq => ({
            frequency: freq,
            value: reflectionLossFunction(freq)
          }));
          frequencies.forEach((f, i) => {
            chartdata[i].data.push([raypath.time!, reflectionLossFunction(f)]);
          });
        } else {
          refloss = reflectionLossFunction;
        }
        this.allReceiverData[this.allReceiverData.length - 1].data.push({
          time: raypath.time!,
          energy: refloss
        });
      }
      this.allReceiverData[this.allReceiverData.length - 1].data = this.allReceiverData[this.allReceiverData.length - 1].data.sort((a, b) => a.time - b.time);
    }
    for (let i = 0; i < chartdata.length; i++) {
      chartdata[i].data = chartdata[i].data.sort((a, b) => a[0] - b[0]);
      chartdata[i].x = chartdata[i].data.map(x => x[0]);
      chartdata[i].y = chartdata[i].data.map(x => x[1]);
    }
    this.messenger.postMessage("UPDATE_CHART_DATA", chartdata);
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
            let sums = receiverData[j].energy.map(x => 0);

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
            sampledArray.push([sampleTime, ...sums.map(x => x / sub_counter)]);

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
      return data.map(x => x.join(",")).join("\n");
    }
    return;
  }
  get precheck() {
    return this.sourceIDs.length > 0 && typeof this.room !== "undefined";
  }
}
