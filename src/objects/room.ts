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
	volume: number;
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
		this.boundingBoxHelper.visible = props.showBoundingBox || false;
			this.deselect = () => {
        this.surfaces.children.forEach((x: Container) => {
          x.deselect();
        });
      };
      this.select = () => {
        this.surfaces.children.forEach((x: Container) => {
          x.select();
        });
			};
		this.volume = this.volumeOfMesh();
	}
	get showBoundingBox() {
		return this.boundingBoxHelper.visible;
	}
	set showBoundingBox(_showBoundingBox: boolean) {
		this.boundingBoxHelper.visible = _showBoundingBox;
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
	signedVolumeOfTriangle(p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3) {
 		return p1.dot(p2.clone().cross(p3)) / 6.0;
	}
	volumeOfMesh() {
		let sum = 0;
		this.surfaces.children.forEach((surface: Surface) => {
			surface._triangles.forEach((triangle: THREE.Triangle) => {
				sum+=this.signedVolumeOfTriangle(triangle.a, triangle.b, triangle.c);	
			})
		})
		return Math.abs(sum);
	}
}
