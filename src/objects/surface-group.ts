import * as THREE from "three";
import Receiver from "./receiver";
import Surface from "./surface";
import Room from "./room";
import Source from "./source";
import { KeyValuePair } from "../common/key-value-pair";
import { EditorModes } from "../constants";
import Container from "./container";

type UserData = {
  [key: string]: any;
};

export interface SurfaceGroupSaveObject {
  name: string;
  visible: boolean;
  position: number[];
  scale: number[];
  rotation: Array<string | number>;
  uuid: string;
  kind: string;
}

export interface SurfaceGroupProps {
  userData?: UserData;
  type?: string;
  children?: Array<Surface | SurfaceGroup>;
}

export default class SurfaceGroup extends Container {
  kind: string;
  selected: boolean;
  renderCallback!: (time?: number) => void;
  constructor(name: string, props?: SurfaceGroupProps) {
    super(name, props);
    this.name = name;
    this.kind = "container";
    props &&
      (() => {
        for (const key in props) {
          this[key] = props[key];
        }
      })();
    this.selected = false;
    this.renderCallback = () => {};
  }
  save() {
    return {
      kind: this.kind,
      visible: this.visible,
      name: this.name,
      position: this.position.toArray(),
      rotation: this.rotation.toArray().slice(0, 3),
      scale: this.scale.toArray(),
      uuid: this.uuid
    } as SurfaceGroupSaveObject;
  }
  restore(state: SurfaceGroupSaveObject) {
    for(const key in state){
      this[key] = state[key];
    }
    return this;
  }
  onModeChange(mode: EditorModes) {}
  select() {
    this.children.forEach((x: Container) => {
      if (x instanceof Container) {
        x.select();
      }
    });
    this.selected = true;
  }
  deselect() {
    this.children.forEach((x: Container) => {
      if (x instanceof Container) {
        x.deselect();
      }
    });
    this.selected = false;
  }
  selectChildren() {
    this.children.forEach((x: Container) => {
      if (x instanceof Container) {
        x.select();
      }
    });
  }
  deselectChildren() {
    this.children.forEach((x: Container) => {
      if (x instanceof Container) {
        x.deselect();
      }
    });
  }
  addSurface(surface: Surface) {
    if (surface instanceof Surface) {
      this.add(surface);
    }
  }
  get x() {
    return this.position.x;
  }
  set x(val) {
    this.position.setX(val);
  }
  get y() {
    return this.position.y;
  }
  set y(val) {
    this.position.setY(val);
  }
  get z() {
    return this.position.z;
  }
  set z(val) {
    this.position.setZ(val);
  }

  get scalex() {
    return this.scale.x;
  }
  set scalex(val) {
    this.scale.setX(val);
  }
  get scaley() {
    return this.scale.y;
  }
  set scaley(val) {
    this.scale.setY(val);
  }
  get scalez() {
    return this.scale.z;
  }
  set scalez(val) {
    this.scale.setZ(val);
  }

  get rotationx() {
    return this.rotation.x;
  }
  set rotationx(val) {
    this.rotation.x = val;
  }
  get rotationy() {
    return this.rotation.y;
  }
  set rotationy(val) {
    this.rotation.y = val;
  }
  get rotationz() {
    return this.rotation.z;
  }
  set rotationz(val) {
    this.rotation.z = val;
  }
}
