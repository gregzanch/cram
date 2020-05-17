import * as THREE from "three";
import Container, { ContainerProps } from "./container";
import Surface from './surface';

import { FDTD } from "../compute/fdtd";
import { UNITS } from "../enums/units";
import { RT_CONSTANTS } from "../constants/rt-constants";
import { third_octave } from "../compute/acoustics";

export interface RoomProps extends ContainerProps {
	surfaces: Surface[];
	// surfaceEdges: Surface[];
	showBoundingBox?: boolean;
	originalFileName?: string;
	originalFileData?: string;
	units?: UNITS;
}

export default class Room extends Container {
	boundingBox!: THREE.Box3;
	surfaces: Container;
	_fdtdmeshid!: number;
	volume: number;
	units: UNITS;
	originalFileName?: string;
	originalFileData?: string;
	constructor(name: string, props: RoomProps) {
		super(name);
		this.originalFileName = props.originalFileName;
		this.originalFileData = props.originalFileData;
		this.units = props.units || UNITS.METERS;
		this.kind = "room";
		this.surfaces = new Container("surfaces");
		props.surfaces.forEach(surface => {
			this.surfaces.add(surface);
		});
		this.add(this.surfaces);
		this.calculateBoundingBox();
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
	calculateBoundingBox() {
		this.boundingBox = this.surfaces.children.reduce((a: THREE.Box3, b: Container) => {
				(b as Surface).geometry.computeBoundingBox();
				return (a as THREE.Box3).union((b as Surface).geometry.boundingBox);
		}, new THREE.Box3());
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
	calculateMeanAbsorptionCoefficientFromHits(frequencies: number[] = third_octave) {
		let totalHits = 0;
		const ha = [] as number[][];
		for (let i = 0; i < this.surfaces.children.length; i++){
			const numHits = (this.surfaces.children[i] as Surface).numHits;
			totalHits += numHits;
			ha.push(
				frequencies.map(
					freq => (this.surfaces.children[i] as Surface).absorptionFunction(freq) * numHits)
			);
		}
		if (totalHits > 0) {
			console.log(ha);
			const meanAbsorption = [] as number[];
			for (let i = 0; i < frequencies.length; i++) {
				let sum = 0;
				for (let j = 0; j < ha.length; j++) {
					sum += ha[j][i];
				}
				meanAbsorption.push(sum / totalHits);
			}
			return {
				meanAbsorption,
				totalHits
			}
		}
		else {
			return {
				meanAbsorption: Array(ha[0].length).fill(0),
				totalHits: 0
			}
		}
	}
	calculateRT60FromHits(frequencies: number[] = third_octave) {
		this.volume = this.volumeOfMesh();
		const unitsConstant = RT_CONSTANTS[this.units] || RT_CONSTANTS[UNITS.METERS];
		const { totalHits, meanAbsorption } = this.calculateMeanAbsorptionCoefficientFromHits(frequencies);
		const totalSurfaceArea = this.surfaces.children.reduce((a, b) => a + (b as Surface).getArea(), 0);
		if (totalHits > 0) {
			const t60 = meanAbsorption.map(alpha => {
					return unitsConstant* this.volume / (alpha * totalSurfaceArea);
					// return (unitsConstant * this.volume) / (-totalHits * Math.log(1 - alpha));
			});
			return [frequencies, t60];
		}
		else {
			return [frequencies, meanAbsorption];
		}
	}
}
