import * as THREE from "three";
import Container, { ContainerProps, ContainerSaveObject } from "./container";
import chroma from 'chroma-js';
import glow from '../render/shaders/glow';
import { MATCAP_PORCELAIN_WHITE, MATCAP_UNDER_SHADOW } from "./asset-store";

const defaults = {
  color: 0xa2c982
};

export interface SourceSaveObject extends ContainerSaveObject{
  color: number;
}


export interface SourceProps extends ContainerProps {
  f?: (t: number) => number;
  theta?: number;
  phi?: number;
}


export default class Source extends Container {
  f: (t: number) => number;
  theta: number;
  phi: number;
  numRays: number;
  mesh: THREE.Mesh;
  selectedMaterial: THREE.MeshMatcapMaterial;
  normalMaterial: THREE.MeshMatcapMaterial;
  constructor(name: string, props?: SourceProps) {
    super(name);
    this.kind = "source";


    this.selectedMaterial = new THREE.MeshMatcapMaterial({
      color: chroma(defaults.color).brighten(1).num(),
      matcap: MATCAP_UNDER_SHADOW
    });
    
    this.normalMaterial = new THREE.MeshMatcapMaterial({
      color: defaults.color,
      matcap: MATCAP_PORCELAIN_WHITE
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
    this.save = () => {
      const name = this.name;
      const visible = this.visible;
      const position = this.position.toArray();
      const scale = this.scale.toArray();
      const rotation = this.rotation.toArray();
      const color = this.getColorAsNumber();
      const uuid = this.uuid;
      return {
        name,
        visible,
        position,
        scale,
        rotation,
        color,
        uuid
      }
    }
    this.restore = (state: SourceSaveObject) => {
      this.name = state.name;
      this.visible = state.visible;
      this.position.set(state.position[0], state.position[1], state.position[2]);
      this.scale.set(state.scale[0], state.scale[1], state.scale[2]);
      this.rotation.set(Number(state.rotation[0]), Number(state.rotation[1]), Number(state.rotation[2]), String(state.rotation[3]));
      this.color = state.color;
      this.uuid = state.uuid;
    }
  }
  
  getColorAsNumber() {
    return (this.mesh.material as THREE.MeshBasicMaterial).color.getHex();
  }
  getColorAsString() {
    return String.fromCharCode(35) + (this.mesh.material as THREE.MeshBasicMaterial).color.getHexString();
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
