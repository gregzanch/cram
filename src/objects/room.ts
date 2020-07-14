import * as THREE from "three";
import Container, { ContainerProps } from "./container";
import Surface, { SurfaceSaveObject } from "./surface";

import { UNITS } from "../enums/units";
import { RT_CONSTANTS } from "../constants/rt-constants";
import { third_octave } from "../compute/acoustics";
import { KVP } from "../common/key-value-pair";
import RT60 from "../compute/rt";

export interface RoomProps extends ContainerProps {
  surfaces: Surface[];
  // surfaceEdges: Surface[];
  originalFileName?: string;
  originalFileData?: string;
  units?: UNITS;
}

export interface RoomSaveObject {
	kind: string;
  surfaces: SurfaceSaveObject[];
  originalFileName: string;
  originalFileData: string;
	units: UNITS;
	uuid: string;
	name: string;
	visible: boolean;
	position: number[];
	rotation: number[];
	scale: number[];
}

export default class Room extends Container {
  boundingBox!: THREE.Box3;
  surfaces!: Container;
  volume!: number;
  units!: UNITS;
  originalFileName!: string;
  originalFileData!: string;
  surfaceMap!: KVP<Surface>;
  rt!: RT60;
  constructor(name: string, props: RoomProps) {
    super(name);
    this.kind = "room";
    this.init(props, true);
  }
  init(props: RoomProps, fromConstructor: boolean = false) {
    if (!fromConstructor) {
      this.remove(this.surfaces);
    }

    this.originalFileName = props.originalFileName || "";
    this.originalFileData = props.originalFileData || "";
    this.units = props.units || UNITS.METERS;
    this.surfaces = new Container("surfaces");
    props.surfaces.forEach((surface) => {
      this.surfaces.add(surface);
    });
    this.add(this.surfaces);
    this.calculateBoundingBox();
    this.volume = this.volumeOfMesh();
    this.surfaceMap = this.surfaces.children.reduce((a, b) => {
      a[b.uuid] = b as Surface;
      return a;
    }, {} as KVP<Surface>);
    this.rt = new RT60({
      name: this.name + "rt60"
    });
  }

	save() {
		return {
			surfaces: this.surfaces.children.map((surf: Surface) => surf.save()),
			kind: this.kind,
      name: this.name,
      uuid: this.uuid,
      units: this.units,
      originalFileData: this.originalFileData,
      originalFileName: this.originalFileName,
      visible: this.visible,
      position: this.position.toArray(),
      rotation: this.rotation.toArray().slice(0, 3),
      scale: this.scale.toArray()
    } as RoomSaveObject;
	}
	restore(state: RoomSaveObject) {
		const surfaces = state.surfaces.map(surfaceState => new Surface(surfaceState.name, { ...surfaceState }).restore(surfaceState));
		this.init({
			...state,
			surfaces
		});
		this.visible = state.visible;
    this.position.set(state.position[0], state.position[1], state.position[2]);
    this.rotation.set(state.rotation[0], state.rotation[1], state.rotation[2], "XYZ");
    this.scale.set(state.scale[0], state.scale[1], state.scale[2]);
		this.uuid = state.uuid;
		return this;
	}
	
  select() {
    this.surfaces.select();
  }
  deselect() {
    this.surfaces.deselect();
  }

  calculateBoundingBox() {
    this.boundingBox = this.surfaces.children.reduce((a: THREE.Box3, b: Container) => {
      (b as Surface).geometry.computeBoundingBox();
      return (a as THREE.Box3).union((b as Surface).geometry.boundingBox);
    }, new THREE.Box3());
    return this.boundingBox;
  }
  signedVolumeOfTriangle(p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3) {
    return p1.dot(p2.clone().cross(p3)) / 6.0;
  }
  volumeOfMesh() {
    let sum = 0;
    this.surfaces.children.forEach((surface: Surface) => {
      surface._triangles.forEach((triangle: THREE.Triangle) => {
        sum += this.signedVolumeOfTriangle(triangle.a, triangle.b, triangle.c);
      });
    });
    return Math.abs(sum);
  }
  calculateMeanAbsorptionCoefficientFromHits(frequencies: number[] = third_octave) {
    let totalHits = 0;
    const ha = [] as number[][];
    for (let i = 0; i < this.surfaces.children.length; i++) {
      const numHits = (this.surfaces.children[i] as Surface).numHits;
      totalHits += numHits;
      ha.push(frequencies.map((freq) => (this.surfaces.children[i] as Surface).absorptionFunction(freq) * numHits));
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
      };
    } else {
      return {
        meanAbsorption: Array(ha[0].length).fill(0),
        totalHits: 0
      };
    }
  }
  calculateRT60FromHits(frequencies: number[] = third_octave) {
    this.volume = this.volumeOfMesh();
    const unitsConstant = RT_CONSTANTS[this.units] || RT_CONSTANTS[UNITS.METERS];
    const { totalHits, meanAbsorption } = this.calculateMeanAbsorptionCoefficientFromHits(frequencies);
    const totalSurfaceArea = this.surfaces.children.reduce((a, b) => a + (b as Surface).getArea(), 0);
    if (totalHits > 0) {
      const t60 = meanAbsorption.map((alpha) => {
        return (unitsConstant * this.volume) / (alpha * totalSurfaceArea);
        // return (unitsConstant * this.volume) / (-totalHits * Math.log(1 - alpha));
      });
      return [frequencies, t60];
    } else {
      return [frequencies, meanAbsorption];
    }
  }
}
