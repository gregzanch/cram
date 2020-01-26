import * as THREE from "three";
import Container, { ContainerProps } from "./container";
import {chunk} from '../common/chunk';
import hash from 'object-hash';
import { KeyValuePair } from "../common/key-value-pair";


const defaults = {
	materials: {
		mesh: new THREE.MeshPhysicalMaterial({
			transparent: true,
			opacity: 0.1,
			side: THREE.DoubleSide,
			metalness: 0.05,
			reflectivity: 0.15,
			roughness: 0.3,
			color: 0xaaaaaa,
			depthWrite: false,
			depthTest: false
		}),

		wire: new THREE.MeshBasicMaterial({
			side: THREE.FrontSide,
			wireframe: true,
			color: 0x2c2d2d
		}),
		line: new THREE.LineBasicMaterial({
			color: 0xaaaaaa
		})
	},
	displayInternalEdges: false,
	displayEdges: true,
	fillSurface: true
};

export interface SurfaceProps extends ContainerProps {
	geometry: THREE.BufferGeometry;
	displayInternalEdges?: boolean;
	displayEdges?: boolean;
	fillSurface?: boolean;
}

interface KeepLine{
	keep: boolean;
	line: number[][];
}

export default class Surface extends Container {
	// for render
	mesh: THREE.Mesh;
	wire: THREE.Mesh;
	edges: THREE.LineSegments;
	displayInternalEdges: boolean;
	displayEdges: boolean;
	triangles: number[][][];
	fillSurface: boolean;
	
	// for acoustics
	absorption!: number[];
	reflection!: number[];
	
	
	constructor(name: string, props: SurfaceProps) {
		super(name);
		this.kind = "surface";
		this.displayInternalEdges = props.displayInternalEdges || defaults.displayInternalEdges;
		this.displayEdges = props.displayEdges || defaults.displayEdges;
		this.fillSurface = props.fillSurface || defaults.fillSurface;
		this.wire = new THREE.Mesh(props.geometry, defaults.materials.wire);
		this.mesh = new THREE.Mesh(props.geometry, defaults.materials.mesh);
		this.mesh.geometry.computeBoundingBox();
		this.mesh.geometry.computeBoundingSphere();
				
		this.triangles = chunk(chunk(Array.from((props.geometry.getAttribute('position') as THREE.BufferAttribute).array), 3), 3);
		
		// console.log(this.triangles);
		const dict = {} as KeyValuePair<KeepLine>;
		this.triangles.forEach(tri => {
			for (let i = 0; i < 3; i++) {
				const line = [tri[i], tri[(i + 1) % 3]];
				const key = JSON.stringify(line.sort());
				if (!dict[key]) {
					dict[key] = {
						keep: true,
						line: line
					};
				}
				else {
					dict[key].keep = false;
				}
			}
		});
		const segments = new THREE.Geometry();
		const edges = Object.keys(dict).reduce((a, b: string) => {
			if (dict[b].keep) {
				a.push(dict[b].line);
			}
			return a;
		}, [] as number[][][]).forEach(edge => {
			edge.forEach(vert => {
				segments.vertices.push(new THREE.Vector3(vert[0], vert[1], vert[2]));
			});
		});
		this.edges = new THREE.LineSegments(segments, defaults.materials.line);
		
		this.add(this.mesh);
		this.mesh.visible = this.fillSurface;
		this.add(this.wire);
		this.wire.visible = this.displayInternalEdges;
		this.add(this.edges);
		this.edges.visible = this.displayEdges;
		
		
	}
	
	
	get geometry() {
		return this.mesh.geometry;
	}
}
