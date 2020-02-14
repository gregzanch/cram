import * as THREE from "three";
import Receiver from "./receiver";
import Surface from "./surface";
import Room from "./room";
import Source from "./source";

type UserData = {
	[key: string]: any;
};

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
