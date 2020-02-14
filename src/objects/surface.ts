import * as THREE from "three";
import Container, { ContainerProps } from "./container";
import {chunk} from '../common/chunk';
import hash from 'object-hash';
import { KeyValuePair } from "../common/key-value-pair";
import Renderer from "../render/renderer";
import interpolateAlpha from '../compute/acoustics/interpolate-alpha';
import reflectionCoefficient from '../compute/acoustics/reflection-coefficient';
import { AcousticMaterial } from "..";
import sprite from '../res/sprites/kramer.png';
import { BRDF } from '../compute/raytracer/brdf';


const glsl = x => x[0];
const defaults = {
  materials: {
    shader: new THREE.ShaderMaterial({
      vertexShader: glsl`
			varying vec2 vUv;

			void main()
			{
				vUv = uv;
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				gl_Position = projectionMatrix * mvPosition;
			}

			`,
      fragmentShader: glsl`
						uniform float time;

			varying vec2 vUv;

			void main( void ) {

				vec2 position = - 1.0 + 2.0 * vUv;

				float red = abs( sin( position.x * position.y + time / 5.0 ) );
				float green = abs( sin( position.x * position.y + time / 4.0 ) );
				float blue = abs( sin( position.x * position.y + time / 3.0 ) );
				gl_FragColor = vec4( red, green, blue, 1.0 );

			}
			`,

			depthTest: true,
						
      uniforms: {
        time: { value: 10.0 }
      },
      visible: true,
      side: THREE.FrontSide
    }),
    selected: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(1, 1, 1),
      emissiveIntensity: 2,
      emissive: new THREE.Color(1, 1, 0),
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      metalness: 0.05,
      reflectivity: 0.15,
      roughness: 0.3,
      depthWrite: true,
      depthTest: false
    }),

    mesh: new THREE.MeshPhysicalMaterial({
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0,
      metalness: 0.05,
      reflectivity: 0.15,
      roughness: 0.3,
      color: 0xaaaaaa,
      depthWrite: true,
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
  _displayVertexNormals: false
};

export interface SurfaceProps extends ContainerProps {
	acousticMaterial: AcousticMaterial;
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
	_triangles: THREE.Triangle[];
	selectedMaterial: THREE.MeshPhysicalMaterial;
	normalMaterial: THREE.MeshPhysicalMaterial;
	normalColor: THREE.Color;
	shaderMaterial: THREE.ShaderMaterial;
	
	// for acoustics
	absorption!: number[];
	absorptionFunction: (freq: number) => number;
	reflection!: number[];
	reflectionFunction: (freq: number, theta: number) => number;
	_acousticMaterial!: AcousticMaterial;
	brdf: BRDF[];
	area!: number;
	// renderer: Renderer;
	constructor(name: string, props: SurfaceProps) {
		super(name);
		this.kind = "surface";
		this.displayInternalEdges = props.displayInternalEdges || defaults.displayInternalEdges;
		this.displayEdges = props.displayEdges || defaults.displayEdges;
		this.fillSurface = props.fillSurface || defaults.fillSurface;
		this._displayVertexNormals = props._displayVertexNormals || defaults._displayVertexNormals;
		this.shaderMaterial = defaults.materials.shader;
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
		));
		
		this.selectedMaterial = defaults.materials.selected;
		this.normalMaterial = defaults.materials.mesh;
		this.normalColor = new THREE.Color(0xaaaaaa);
		this.select = this.select.bind(this);
		this.select = this.deselect.bind(this);
		
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
		
		// this.absorption = [0.05, 0.15, 0.10, 0.05, 0.04, 0.07, 0.09, 0.09];
		this.absorption = [0.00,0.04,0.23,0.52,0.90,0.94,0.66,0.66];
		const freq = [63, 125, 250, 500, 1000., 2000, 4000, 8000];
		this.absorptionFunction = interpolateAlpha(this.absorption, freq);
		this.reflectionFunction = (freq, theta) => reflectionCoefficient(this.absorptionFunction(freq), theta);
		this.acousticMaterial = props.acousticMaterial;
		this.brdf = [] as BRDF[];
		for (const key in this.acousticMaterial.absorption){
			this.brdf.push(new BRDF({
				absorptionCoefficient: this.acousticMaterial.absorption[key],
				diffusionCoefficient: 0.1
			}));	
		}
		
		this.select = () => {
			this.selected = true;
			(this.mesh
				.material as THREE.MeshPhysicalMaterial | THREE.ShaderMaterial) = this.selectedMaterial;
			(this.mesh.material as THREE.MeshPhysicalMaterial).needsUpdate = true;
			// setInterval(() => {
			// 	//@ts-ignore
			// 	(this.mesh.material as THREE.ShaderMaterial).uniforms["time"] += 1;
			// }, 16);
		};
		this.deselect = () => {
			this.selected = false;
			(this.mesh
				.material as THREE.MeshPhysicalMaterial) = this.normalMaterial;
			(this.mesh.material as THREE.MeshPhysicalMaterial).needsUpdate = true;
		};
		this.getArea();
	}
	get acousticMaterial() {
		return this._acousticMaterial;
	}
	set acousticMaterial(material: AcousticMaterial) {
		this._acousticMaterial = material;
		const freq = Object.keys(this._acousticMaterial.absorption).map(x => Number(x));
		this.absorption = freq.map(x => this._acousticMaterial.absorption[String(x)]);
		this.absorptionFunction = interpolateAlpha(this.absorption, freq);
    this.reflectionFunction = (freq, theta) =>
      reflectionCoefficient(this.absorptionFunction(freq), theta);
    this.brdf = [] as BRDF[];
    for (const key in this.acousticMaterial.absorption) {
      this.brdf.push(
        new BRDF({
          absorptionCoefficient: this.acousticMaterial.absorption[key],
          diffusionCoefficient: 0.1
        })
      );
    }
	}
	getArea() {
		this.area = 0;
		for (let i = 0; i < this._triangles.length; i++){
			this.area += this._triangles[i].getArea();
		}
		return this.area;
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
