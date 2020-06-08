import * as THREE from "three";
import Container, { ContainerProps } from "./container";
import chroma from 'chroma-js';
import map from "../common/map";
import { MATCAP_PORCELAIN_WHITE, MATCAP_UNDER_SHADOW } from "./asset-store";
import { EditorModes } from "../constants/editor-modes";


const defaults = {
  color: 0xa2c982
};

export interface SourceSaveObject {
  name: string;
  visible: boolean;
  position: number[];
  scale: number[];
  rotation: Array<string | number>;
  uuid: string;
  kind: string;
  color: number;
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
}


export default class Source extends Container {
  f: (t: number) => number;
  theta: number;
  phi: number;
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
  signalSource: SignalSource;
  initialSPL: number;
  constructor(name: string, props?: SourceProps) {
    super(name);
    this.kind = "source";
    this.signalSource = SignalSource.OSCILLATOR;
    this.previousX = this.position.x;
    this.previousY = this.position.y;
    this.previousZ = this.position.z;
    this.shouldClearPreviousPosition = false;
    this.initialSPL = 120;
    this.amplitude = 1;
    this.frequency = 100;
    this.phase = 0;
    this.value = 0;
    this.previousValue = 0;
    this.velocity = 0;
    this.rgba = [0, 0, 0, 1];
    
    

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
    this.theta = (props && props.theta) || Math.PI / 4;
    this.phi = (props && props.phi) || Math.PI / 2;
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
    this.renderCallback = (time?: number) => { };

    
    this.updateWave = this.updateWave.bind(this);
    this.updatePreviousPosition = this.updatePreviousPosition.bind(this);
    this.getWhiteNoiseSample = this.getWhiteNoiseSample.bind(this);
    this.getOscillatorSample = this.getOscillatorSample.bind(this);
    this.getPinkNoiseSample = this.getPinkNoiseSample.bind(this);
    this.generatePinkNoiseSamples = this.generatePinkNoiseSamples.bind(this);
    
    
    this.pinkNoiseSamples = new Float32Array(1024);
    this.generatePinkNoiseSamples();

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
  updateWave(time: number, frame: number) {

    if (this.position.x != this.previousX || this.position.y != this.previousY || this.position.z != this.previousZ) {
      this.shouldClearPreviousPosition = true;
    }
    
    
    this.previousValue = this.value;
    
    switch (this.signalSource) {
      case SignalSource.NONE: {
        this.value = 0;
      } break;
      case SignalSource.OSCILLATOR: {
        this.value = this.getOscillatorSample(time);
      } break;
      case SignalSource.PINK_NOISE: {
        this.value = this.getPinkNoiseSample(frame);
      } break;
      case SignalSource.WHITE_NOISE: {
        this.value = this.getWhiteNoiseSample();
      } break;
      default: break;
    }
    
    
    this.velocity = this.value - this.previousValue;
    this.rgba[0] = map(this.value, -2, 2, 0, 255);
    this.rgba[1] = map(this.velocity, -2, 2, 0, 255);
    this.rgba[3] = 0;
  }
  getWhiteNoiseSample() {
    return Math.random() * 2 - 1;
  }
  getOscillatorSample(time: number) {
    return this.amplitude * Math.sin(2 * Math.PI * this.frequency * time + this.phase);
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
  getColorAsNumber() {
    return (this.mesh.material as THREE.MeshBasicMaterial).color.getHex();
  }
  getColorAsString() {
    return String.fromCharCode(35) + (this.mesh.material as THREE.MeshBasicMaterial).color.getHexString();
  }
  onModeChange(mode: EditorModes) {
    switch (mode) {
      case EditorModes.OBJECT: { 
      } break;
      case EditorModes.SKETCH: { 
      } break;
      case EditorModes.EDIT: { 
      } break;
      default: break;
    }
  }
  get color() {
    return String.fromCharCode(35)+(this.mesh.material as THREE.MeshBasicMaterial).color.getHexString();
  }
  set color(col: string | number) {
    if (typeof col === "string") {
      (this.mesh.material as THREE.MeshMatcapMaterial).color.setStyle(col);
      (this.normalMaterial as THREE.MeshMatcapMaterial).color.setStyle(col);
      (this.selectedMaterial as THREE.MeshMatcapMaterial).color.setStyle(col);
    }
    else {
      (this.mesh.material as THREE.MeshMatcapMaterial).color.setHex(col);
      (this.normalMaterial as THREE.MeshMatcapMaterial).color.setHex(col);
      (this.selectedMaterial as THREE.MeshMatcapMaterial).color.setHex(col);
    }
  }
}
