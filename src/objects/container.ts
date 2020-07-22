import * as THREE from "three";
import Receiver from "./receiver";
import Surface from "./surface";
import Room from "./room";
import Source from "./source";
import { KeyValuePair } from "../common/key-value-pair";
import { EditorModes } from "../constants";

type UserData = {
	[key: string]: any;
};

export interface ContainerSaveObject {
	name: string;
  visible: boolean;
  position: number[];
  scale: number[];
  rotation: Array<string|number>;
	uuid: string;
	kind: string;
	color?: number; 
}

export interface ContainerProps extends Partial<ContainerSaveObject>{
	userData?: UserData;
	type?: string;
	children?: Array<THREE.Object3D | Container | THREE.Group>;
}

export default class Container extends THREE.Group {
	kind: string;
	selected: boolean;
	private _color: THREE.Color;
	renderCallback!: (time?: number) => void;
	constructor(name: string, props?: ContainerProps) {
		super();
		this.name = name;
		this.kind = "container";
		this._color = new THREE.Color(0xaaaaaa);
		props &&
			(() => {
				for (const key in props) {
					this[key] = props[key];
				}
			})();
		this.selected = false;
		this.renderCallback = () => { };
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
		} as ContainerSaveObject;
	}
	restore(state: any){ }
	onModeChange(mode: EditorModes) {	}
	select() {
		this.children.forEach((x: Surface) => {
      if (x instanceof Surface) {
        x.select();
      }
    });
		this.selected = true;
	}
	deselect() { 
		this.children.forEach((x: Surface) => {
      if (x instanceof Surface) {
        x.deselect();
      }
    });
		this.selected = false;
	}
	selectChildren() {
		this.children.forEach((x: Surface) => {
      if (x instanceof Surface) {
        x.select();
      }
    });
	}
	deselectChildren() { 
		this.children.forEach((x: Surface) => {
      if (x instanceof Surface) {
        x.deselect();
      }
    });
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
	
  get color() {
    return String.fromCharCode(35)+this._color.getHexString();
  }
	set color(col: string | number) {
		this._color = new THREE.Color(col);
  }
  

}
