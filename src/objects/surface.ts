import * as THREE from "three";
import Container, { ContainerProps } from "./container";
import {chunk} from '../common/chunk';
import hash from 'object-hash';
import { KeyValuePair } from "../common/key-value-pair";
import Renderer from "../render/renderer";


const defaults = {
	materials: {
		mesh: new THREE.MeshPhysicalMaterial({
			transparent: true,
			opacity: 0.1,
			side: THREE.FrontSide,
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
	fillSurface: true,
	_displayVertexNormals: false,
};

export interface SurfaceProps extends ContainerProps {
	geometry: THREE.BufferGeometry;
	displayInternalEdges?: boolean;
	displayEdges?: boolean;
	fillSurface?: boolean;
	_displayVertexNormals?: boolean;
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
	_displayVertexNormals: boolean;
	vertexNormals: THREE.VertexNormalsHelper;
	// for acoustics
	absorption!: number[];
	reflection!: number[];
	_triangles: THREE.Triangle[];
	// renderer: Renderer;
	constructor(name: string, props: SurfaceProps) {
		super(name);
		this.kind = "surface";
		this.displayInternalEdges = props.displayInternalEdges || defaults.displayInternalEdges;
		this.displayEdges = props.displayEdges || defaults.displayEdges;
		this.fillSurface = props.fillSurface || defaults.fillSurface;
		this._displayVertexNormals = props._displayVertexNormals || defaults._displayVertexNormals;
		this.wire = new THREE.Mesh(props.geometry, defaults.materials.wire);
		this.mesh = new THREE.Mesh(props.geometry, defaults.materials.mesh);
		this.mesh.geometry.computeBoundingBox();
		this.mesh.geometry.computeBoundingSphere();
		// this.mesh.geometry.computeVertexNormals();
		const tempmesh = new THREE.Mesh(props.geometry.clone(), undefined);
		tempmesh.geometry.computeVertexNormals()
		this.vertexNormals = new THREE.VertexNormalsHelper(tempmesh, 0.25, 0xff0000, 1);
		
		this.triangles = chunk(chunk(Array.from((props.geometry.getAttribute('position') as THREE.BufferAttribute).array), 3), 3);
		this._triangles = this.triangles.map(x => new THREE.Triangle(
			new THREE.Vector3(...x[0]),
			new THREE.Vector3(...x[1]),
			new THREE.Vector3(...x[2]),
		));4
		

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
		this.add(this.vertexNormals);
		this.vertexNormals.visible = this._displayVertexNormals;
		
	}
	
	getEdges() {
		return this.edges;
	}
	get displayVertexNormals() {
		return this.vertexNormals.visible;
	}
	set displayVertexNormals(displayVertexNormals: boolean) {
		this.vertexNormals.visible = displayVertexNormals
	}
	
	get geometry() {
		return this.mesh.geometry;
	}
}
