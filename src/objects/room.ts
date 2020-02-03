import * as THREE from "three";
import Container, { ContainerProps } from "./container";
import Surface from './surface';
import { FDTD } from "../compute/fdtd";

export interface RoomProps extends ContainerProps {
	surfaces: Surface[];
	// surfaceEdges: Surface[];
	showBoundingBox?: boolean;
}

export default class Room extends Container {
	boundingBox!: THREE.Box3;
	boundingBoxHelper!: THREE.Box3Helper;
	surfaces: Container;
	_fdtdmeshid!: number;
	constructor(name: string, props: RoomProps) {
		super(name);
		this.kind = "room";
		this.surfaces = new Container("surfaces");
		props.surfaces.forEach(surface => {
			this.surfaces.add(surface);
		});
		this.add(this.surfaces);
		this.calculateBoundingBox();
		this.add(this.boundingBoxHelper);
		this.boundingBoxHelper.visible = props.showBoundingBox || true;
	}
	calculateBoundingBox() {
		this.boundingBox = this.surfaces.children.reduce((a: THREE.Box3, b: Container) => {
				(b as Surface).geometry.computeBoundingBox();
				return (a as THREE.Box3).union((b as Surface).geometry.boundingBox);
		}, new THREE.Box3());
		this.boundingBoxHelper = new THREE.Box3Helper(this.boundingBox, new THREE.Color(0xF18E4A));
		this.boundingBoxHelper.name = "bounding-box"
		return this.boundingBox;
	}
	setFDTD(mesh: THREE.Mesh) {
		this._fdtdmeshid = mesh.id;
		this.add(mesh);
	}
	getFDTDPressureAttribute(): THREE.InstancedBufferAttribute {
		return (((this.getObjectById(this._fdtdmeshid) as THREE.Mesh).geometry as THREE.InstancedBufferGeometry).getAttribute('pressure') as THREE.InstancedBufferAttribute)
	}
}
