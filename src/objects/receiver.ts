import * as THREE from "three";
import Container, { ContainerProps, getContainersOfKind } from "./container";
import chroma from "chroma-js";
import { MATCAP_PORCELAIN_WHITE, MATCAP_UNDER_SHADOW } from "./asset-store";
import FileSaver from "file-saver";
import { EditorModes } from "../constants/editor-modes";
import { on } from "../messenger";
import { addContainer, removeContainer, setContainerProperty, useContainer } from "../store";
import { renderer } from "../render/renderer";
// import { vs, fs } from '../render/shaders/glow';

export interface ReceiverSaveObject {
  name: string;
  visible: boolean;
  position: number[];
  scale: number[];
  rotation: Array<string | number>;
  uuid: string;
  kind: string;
  color: number;
}

export interface ReceiverProps extends ContainerProps {}

const defaults = {
  color: 0xdd6f6f,
  selectedColor: 0x9fcbff
};

export class Receiver extends Container {
  mesh: THREE.Mesh;
  selectedMaterial: THREE.MeshMatcapMaterial;
  normalMaterial: THREE.MeshMatcapMaterial;
  fdtdSamples: number[];
  constructor(name?: string, props?: ReceiverProps) {
    super(name||"new receiver");
    this.kind = "receiver";
    this.fdtdSamples = [] as number[];

    this.selectedMaterial = new THREE.MeshMatcapMaterial({
      fog: false,
      color: defaults.color,
      matcap: MATCAP_UNDER_SHADOW,
      name: "receiver-selected-material"
    });

    this.normalMaterial = new THREE.MeshMatcapMaterial({
      fog: false,
      color: defaults.color,
      matcap: MATCAP_PORCELAIN_WHITE,
      name: "receiver-material"
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 16), this.normalMaterial);
    this.mesh.userData["kind"] = "receiver";
    this.add(this.mesh);
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
    } as ReceiverSaveObject;
  }
  restore(state: ReceiverSaveObject) {
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
  clearSamples() {
    this.fdtdSamples = [] as number[];
  }
  saveSamples() {
    if (this.fdtdSamples.length > 0) {
      const blob = new Blob([this.fdtdSamples.join("\n")], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, `fdtdsamples-receiver-${this.name}.txt`);
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
    ADD_RECEIVER: Receiver | undefined;
    RECEIVER_SET_PROPERTY: SetPropertyPayload<Receiver>;
    REMOVE_RECEIVER: string;
  }
}

on("ADD_RECEIVER", addContainer(Receiver))
on("REMOVE_RECEIVER", removeContainer);
on("RECEIVER_SET_PROPERTY", setContainerProperty);

export const getReceivers = () => getContainersOfKind<Receiver>("receiver");


export default Receiver;