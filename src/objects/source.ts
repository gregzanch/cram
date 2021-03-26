import * as THREE from "three";
import * as ac from "../compute/acoustics"
import Container, { ContainerProps, ContainerSaveObject, getContainersOfKind } from "./container";
import chroma from "chroma-js";
import map from "../common/map";
import { MATCAP_PORCELAIN_WHITE, MATCAP_UNDER_SHADOW } from "./asset-store";
import { EditorModes } from "../constants/editor-modes";
import { P2I, Lp2P } from "../compute/acoustics";
import FileSaver from "file-saver";
import { on } from "../messenger";
import { addContainer, callContainerMethod, removeContainer, setContainerProperty, useContainer } from "../store";
import {CLFResult} from "../import-handlers/CLFParser";
import {dirinterp, dirDataPoint} from "../common/dir-interpolation";
import { AllowedNames, FilterFlags, filterObjectToArray } from "../common/helpers";
import { renderer } from "../render/renderer";

const defaults = {
  color: 0xa2c982
};

export interface SourceSaveObject extends ContainerSaveObject {
  name: string;
  visible: boolean;
  position: number[];
  scale: number[];
  rotation: Array<string | number>;
  uuid: string;
  kind: "source";
  color: number;
  signalSource: SignalSource;
  amplitude: number;
  frequency: number;
  phase: number;
}

export interface SourceProps extends ContainerProps {
  f?: (t: number) => number;
  theta?: number;
  phi?: number;
}

export enum SignalSource {
  NONE = 0,
  OSCILLATOR = 1,
  PINK_NOISE = 2,
  WHITE_NOISE = 3,
  PULSE = 4
}

export const SignalSourceOptions = [{
  value: `${SignalSource.NONE}`,
  label: "None",
},{
  value: `${SignalSource.OSCILLATOR}`,
  label: "Oscillator",
},{
  value: `${SignalSource.PINK_NOISE}`,
  label: "Pink Noise",
},{
  value: `${SignalSource.WHITE_NOISE}`,
  label: "White Noise",
},{
  value: `${SignalSource.PULSE}`,
  label: "Pulse",
}];

export class Source extends Container {
  f: (t: number) => number;
  
  public theta: number;
  public phi: number;
  
  numRays: number;
  mesh: THREE.Mesh;
  selectedMaterial: THREE.MeshMatcapMaterial;
  normalMaterial: THREE.MeshMatcapMaterial;
  amplitude: number;
  frequency: number;
  phase: number;
  value: number;
  previousValue: number;
  velocity: number;
  rgba: number[];
  previousX: number;
  previousY: number;
  previousZ: number;
  shouldClearPreviousPosition: boolean;
  pinkNoiseSamples: Float32Array;
  public signalSource: SignalSource;
  private _initialSPL: number;
  private _initialIntensity: number;
  fdtdSamples: number[];
  public directivityHandler: DirectivityHandler; 

  constructor(name?: string, props?: SourceProps) {
    super(name||"new source");
    this.kind = "source";
    this.signalSource = SignalSource.OSCILLATOR;
    this.previousX = this.position.x;
    this.previousY = this.position.y;
    this.previousZ = this.position.z;
    this.shouldClearPreviousPosition = false;
    this._initialSPL = 120;
    this._initialIntensity = P2I(Lp2P(this._initialSPL)) as number;
    this.amplitude = 1;
    this.frequency = 100;
    this.phase = 0;
    this.value = 0;
    this.previousValue = 0;
    this.velocity = 0;
    this.rgba = [0, 0, 0, 1];
    this.fdtdSamples = [] as number[];
    this.directivityHandler = new DirectivityHandler(0); // assume omni source 

    this.selectedMaterial = new THREE.MeshMatcapMaterial({
      fog: false,
      color: chroma(defaults.color).brighten(1).num(),
      matcap: MATCAP_UNDER_SHADOW,
      name: "source-selected-material"
    });

    this.normalMaterial = new THREE.MeshMatcapMaterial({
      fog: false,
      color: defaults.color,
      matcap: MATCAP_PORCELAIN_WHITE,
      name: "source-material"
    });
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 32, 16),
      // pointsGeometry,
      // pointsMaterial,
      this.normalMaterial
    );
    this.mesh.userData["kind"] = "source";
    this.add(this.mesh);

    this.f = (props && props.f) || ((t) => Math.sin(t));
    this.theta = (props && props.theta) || 180;
    this.phi = (props && props.phi) || 360;
    this.numRays = 0;
    this.select = () => {
      if (!this.selected) {
        this.selected = true;
        let brighterColor = chroma((this.mesh.material as THREE.MeshMatcapMaterial).color.getHex())
          .brighten(1)
          .num();
        this.selectedMaterial.color.setHex(brighterColor);
        this.mesh.material = this.selectedMaterial;
      }
    };
    this.deselect = () => {
      if (this.selected) {
        this.selected = false;
        this.mesh.material = this.normalMaterial;
      }
    };
    this.renderCallback = (time?: number) => {};

    this.updateWave = this.updateWave.bind(this);
    this.updatePreviousPosition = this.updatePreviousPosition.bind(this);
    this.getWhiteNoiseSample = this.getWhiteNoiseSample.bind(this);
    this.getOscillatorSample = this.getOscillatorSample.bind(this);
    this.getPinkNoiseSample = this.getPinkNoiseSample.bind(this);
    this.generatePinkNoiseSamples = this.generatePinkNoiseSamples.bind(this);

    this.pinkNoiseSamples = new Float32Array(1024);
    this.generatePinkNoiseSamples();
    renderer.add(this);
  }

  dispose(){
    renderer.remove(this);
  }

  save() {
    const name = this.name;
    const visible = this.visible;
    const position = this.position.toArray();
    const scale = this.scale.toArray();
    const rotation = this.rotation.toArray();
    const color = this.getColorAsNumber();
    const uuid = this.uuid;
    const kind = this.kind;
    return {
      kind,
      name,
      visible,
      position,
      scale,
      rotation,
      color,
      uuid
    } as SourceSaveObject;
  }
  restore(state: SourceSaveObject) {
    this.name = state.name;
    this.visible = state.visible;
    this.position.set(state.position[0], state.position[1], state.position[2]);
    this.scale.set(state.scale[0], state.scale[1], state.scale[2]);
    this.rotation.set(
      Number(state.rotation[0]),
      Number(state.rotation[1]),
      Number(state.rotation[2]),
      String(state.rotation[3])
    );
    this.color = state.color;
    this.uuid = state.uuid;
    return this;
  }
  updatePreviousPosition() {
    this.previousX = this.position.x;
    this.previousY = this.position.y;
    this.previousZ = this.position.z;
  }
  updateWave(time: number, frame: number, dt: number) {
    if (this.position.x != this.previousX || this.position.y != this.previousY || this.position.z != this.previousZ) {
      this.shouldClearPreviousPosition = true;
    }

    this.previousValue = this.value;

    switch (this.signalSource) {
      case SignalSource.NONE:
        {
          this.value = 0;
        }
        break;
      case SignalSource.OSCILLATOR:
        {
          this.value = this.getOscillatorSample(time);
        }
        break;
      case SignalSource.PINK_NOISE:
        {
          this.value = this.getPinkNoiseSample(frame);
        }
        break;
      case SignalSource.WHITE_NOISE:
        {
          this.value = this.getWhiteNoiseSample();
        }
        break;
      case SignalSource.PULSE:
        {
          this.value = this.getPulseSample(time, dt);
        }
        break;
      default:
        break;
    }

    this.velocity = this.value - this.previousValue;
    this.rgba[0] = map(this.value, -2, 2, 0, 255);
    this.rgba[1] = map(this.velocity, -2, 2, 0, 255);
    this.rgba[3] = 0;
  }
  recordSample() {
    this.fdtdSamples.push(this.value);
  }
  getWhiteNoiseSample() {
    return Math.random() * 2 - 1;
  }
  getOscillatorSample(time: number) {
    return this.amplitude * Math.sin(2 * Math.PI * this.frequency * time + this.phase);
  }
  getPulseSample(time: number, dt: number) {
    const period = 1 / this.frequency;

    return time % period < dt ? this.amplitude : 0;
  }
  getPinkNoiseSample(frame: number) {
    if (frame % this.pinkNoiseSamples.length == this.pinkNoiseSamples.length - 1) {
      this.generatePinkNoiseSamples();
    }
    return this.pinkNoiseSamples[frame % this.pinkNoiseSamples.length];
  }
  generatePinkNoiseSamples() {
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;
    for (var i = 0; i < this.pinkNoiseSamples.length; i++) {
      var white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      this.pinkNoiseSamples[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      this.pinkNoiseSamples[i] *= 0.11; // (roughly) compensate for gain
      b6 = white * 0.115926;
    }
    // console.log(Array.from(this.pinkNoiseSamples));
  }
  clearSamples() {
    this.fdtdSamples = [] as number[];
  }
  saveSamples() {
    if (this.fdtdSamples.length > 0) {
      const blob = new Blob([this.fdtdSamples.join("\n")], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, `fdtdsamples-source-${this.name}.txt`);
    } else return;
  }
  getColorAsNumber() {
    return (this.mesh.material as THREE.MeshBasicMaterial).color.getHex();
  }
  getColorAsString() {
    return String.fromCharCode(35) + (this.mesh.material as THREE.MeshBasicMaterial).color.getHexString();
  }
  onModeChange(mode: EditorModes) {
    switch (mode) {
      case EditorModes.OBJECT:
        {
        }
        break;
      case EditorModes.SKETCH:
        {
        }
        break;
      case EditorModes.EDIT:
        {
        }
        break;
      default:
        break;
    }
  }

  get color() {
    return String.fromCharCode(35) + (this.mesh.material as THREE.MeshBasicMaterial).color.getHexString();
  }
  set color(col: string | number) {
    if (typeof col === "string") {
      (this.mesh.material as THREE.MeshMatcapMaterial).color.setStyle(col);
      (this.normalMaterial as THREE.MeshMatcapMaterial).color.setStyle(col);
      (this.selectedMaterial as THREE.MeshMatcapMaterial).color.setStyle(col);
    } else {
      (this.mesh.material as THREE.MeshMatcapMaterial).color.setHex(col);
      (this.normalMaterial as THREE.MeshMatcapMaterial).color.setHex(col);
      (this.selectedMaterial as THREE.MeshMatcapMaterial).color.setHex(col);
    }
  }
  get initialSPL() {
    return this._initialSPL;
  }
  set initialSPL(spl: number) {
    this._initialSPL = spl;
  }
  get initialIntensity() {
    return this._initialIntensity;
  }
  get brief() {
    return {
      uuid: this.uuid,
      name: this.name,
      selected: this.selected,
      kind: this.kind,
      children: []
    };
  }
}


// this allows for nice type checking with 'on' and 'emit' from messenger
declare global {
  interface EventTypes {
    ADD_SOURCE: Source | undefined;
    SOURCE_SET_PROPERTY: SetPropertyPayload<Source>;
    REMOVE_SOURCE: string;
    SOURCE_CALL_METHOD: CallContainerMethod<Source>;
  }
}


on("ADD_SOURCE", addContainer(Source));
on("REMOVE_SOURCE", removeContainer);
on("SOURCE_SET_PROPERTY", setContainerProperty);
on("SOURCE_CALL_METHOD", callContainerMethod);

export const getSources = () => getContainersOfKind<Source>("source");

export default Source;


/**
 * Directivity Handler
 **/

export class DirectivityHandler {
  private dirDataList: directivityData[];
  public frequencies: number[]; 
  public sensitivity: number[];
  public sourceDirType: number; 
  public phi: number[]; 
  public theta: number[]; 
  public clfData; 

  constructor(sourceType: number, importData?: CLFResult){ 
    // if we add more input types, make corresponding result types acceptable as importData type

    this.sourceDirType = sourceType; 

    switch (sourceType){
      case 0: // omni source
        this.frequencies = [0]; // any frequency 
        this.dirDataList = []; 
        this.phi = []; 
        this.theta = []; 
        this.sensitivity = [90]; // placeholder (90 dBSPL on-axis 1m away at all frequencies)

        break; 
      
      case 1: // user defined CLF
      
        if (importData){
          this.frequencies = importData.frequencies; 
          this.dirDataList = importData.directivity; 
          this.phi = importData.phi;
          this.theta = importData.theta; 
          this.sensitivity = importData.sensitivity; 
          this.clfData = importData; 
        }else{
          console.error("DH CLF Import Type specified but no CLFResult data was provided")
          this.frequencies = [0]; // any frequency 
          this.dirDataList = []; 
          this.phi = []; 
          this.theta = []; 
          this.sensitivity = []; 
          this.clfData = importData; 
        }

        break;
      
      default: // other (behave as omni)
        this.frequencies = [0]; 
        this.dirDataList = []; 
        this.phi = []; 
        this.theta = []; 
        this.sensitivity = []; 
        
        console.error("Unknown Source Directivity Type");
        break; 
    }

  } 

  getPressureAtPosition(gain: number,frequency:number,phi:number,theta:number){
    // returns relative Pa of source at a position w.r.t on-axis value 

    switch(this.sourceDirType){

      case 0: // omni
        return ac.Lp2P(this.sensitivity[0]+gain); 

      case 1: // CLF defined

        let angularRes= this.clfData.angleres; 
        let nearestPhi = Math.round(phi / angularRes) * angularRes; 

        let upperPhi: number; 
        let lowerPhi: number; 

        if(nearestPhi > phi){
          upperPhi = nearestPhi; 
          lowerPhi = upperPhi - angularRes; 
        }else{
          lowerPhi = nearestPhi;
          upperPhi = lowerPhi + angularRes; 
        }

        if(upperPhi==360){
          upperPhi = 0; 
        }

        let nearestTheta = Math.round(theta/angularRes)*angularRes; 

        let upperTheta: number; 
        let lowerTheta: number; 

        if(nearestTheta > theta){
          upperTheta = nearestTheta; 
          lowerTheta = upperTheta - angularRes; 
        }else{
          lowerTheta = nearestTheta;
          upperTheta = lowerTheta + angularRes; 
        }

        let f_index = this.frequencies.indexOf(frequency); 
        (f_index == -1) && (console.error("invalid frequency")); 

        let p1: dirDataPoint = {
          phi: lowerPhi, 
          theta: lowerTheta, 
          directivity: this.dirDataList[f_index].directivity[lowerPhi/angularRes][lowerTheta/angularRes]
        };

        let p2: dirDataPoint = {
          phi: lowerPhi, 
          theta: upperTheta, 
          directivity: this.dirDataList[f_index].directivity[lowerPhi/angularRes][upperTheta/angularRes]
        };

        let p3: dirDataPoint = {
          phi: upperPhi, 
          theta: lowerTheta, 
          directivity: this.dirDataList[f_index].directivity[upperPhi/angularRes][lowerTheta/angularRes]
        };

        let p4: dirDataPoint = {
          phi: upperPhi, 
          theta: upperTheta, 
          directivity: this.dirDataList[f_index].directivity[upperPhi/angularRes][upperTheta/angularRes]
        };

        console.log(p1);
        console.log(p2);
        console.log(p3);
        console.log(p4);

        let interp_pressure = ac.Lp2P(dirinterp(phi,theta,p1,p2,p3,p4)+this.sensitivity[f_index]+gain)
        return interp_pressure;

      default: // behave as omni
        return ac.Lp2P(this.sensitivity[0]+gain);;
    
    }

  }

}

enum sourceDirTypes {
  Omni = 0,
  UserDefinedCLF
}

export interface directivityData{
  frequency: number;
  directivity: number[][]; 
}

function containerCallMethod(arg0: string, containerCallMethod: any) {
  throw new Error("Function not implemented.");
}

