import * as THREE from "three";
import Receiver from "./receiver";
import Surface from "./surface";
import Room from "./room";
import Source from "./source";
import { KeyValuePair } from "../common/key-value-pair";

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
}

export interface ContainerProps {
	userData?: UserData;
	type?: string;
	children?: Array<THREE.Object3D | Container | THREE.Group>;
}

export default class Container extends THREE.Group {
	kind: string;
	selected: boolean;
	select!: () => void;
	deselect!: () => void;
	renderCallback!: (time?: number) => void;
	save: () => ContainerSaveObject;
	restore: (state: ContainerSaveObject) => void;
	constructor(name: string, props?: ContainerProps) {
		super();
		this.name = name;
		this.kind = "container";
		props &&
			(() => {
				for (const key in props) {
					this[key] = props[key];
				}
			})();
		this.selected = false;
		this.select = () => {
			// this.children.forEach((child: Receiver | Room | Source | Surface) => {
			// 	if (child['kind']) {
			// 		child.select();
			// 	}
			// })
			// this.selected = true;
		};
		this.deselect = () => {
			// this.children.forEach((child: Receiver | Room | Source | Surface) => {
			// 		if (child["kind"]) {
			// 			child.deselect();
			// 		}
			// });
			// this.selected = false;
		};
		this.renderCallback = () => { };
		this.save = () => {
      const name = this.name;
      const visible = this.visible;
      const position = this.position.toArray();
      const scale = this.scale.toArray();
      const rotation = this.rotation.toArray() as Array<string|number>;
      const uuid = this.uuid;
      return {
        name,
        visible,
        position,
        scale,
        rotation,
        uuid
      };
    };
		this.restore = (state: ContainerSaveObject) => { 
			this.name = state.name || "surface";
			this.visible = state.visible;
			this.position.set(state.position[0], state.position[1], state.position[2]);
			this.scale.set(state.scale[0], state.scale[1], state.scale[2]);
			this.rotation.set(Number(state.rotation[0]), Number(state.rotation[1]), Number(state.rotation[2]), String(state.rotation[3]));
			this.uuid = state.uuid;
		};
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
