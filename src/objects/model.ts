import { last, map } from "lodash";
import * as THREE from "three";
import { chunk } from "../common/chunk";
import { addIfUnique } from "../common/helpers";
import Container, { ContainerProps } from "./container";
import Surface, { SurfaceSaveObject } from "./surface";
const { min, max, abs } = Math;

export interface ModelProps extends ContainerProps {
  bufferGeometry: THREE.BufferGeometry;
}

export interface ModelSaveObject {
  kind: string;
  uuid: string;
  name: string;
  visible: boolean;
  position: number[];
  rotation: number[];
  scale: number[];
}

export default class Model extends Container {
  boundingBox!: THREE.Box3;
  volume!: number;
  mesh!: THREE.Mesh;
  constructor(name: string, props: ModelProps) {
    super(name);
    this.kind = "model";
    this.init(props, true);
  }
  init(props: ModelProps, fromConstructor: boolean = false) {
    const { bufferGeometry } = props;
    const positionBuffer = bufferGeometry.getAttribute("position") as THREE.BufferAttribute;
    const normalBuffer = bufferGeometry.getAttribute("NORMAL") as THREE.BufferAttribute;
    const vertexMap = new Map<string, number>();
    const indices = [] as number[];
    const edgeindices = [] as number[];
    const vertices = [] as number[];
    const normals = [] as number[];
    const colors = [] as number[];

    for (let i = 0; i < positionBuffer.count; i++) {
      let hash = "";
      hash += positionBuffer.array[i * positionBuffer.itemSize + 0].toFixed(6);
      hash += positionBuffer.array[i * positionBuffer.itemSize + 1].toFixed(6);
      hash += positionBuffer.array[i * positionBuffer.itemSize + 2].toFixed(6);
      if (!vertexMap.has(hash)) {
        vertexMap.set(hash, vertexMap.size);
        vertices.push(
          positionBuffer.array[i * positionBuffer.itemSize + 0],
          positionBuffer.array[i * positionBuffer.itemSize + 1],
          positionBuffer.array[i * positionBuffer.itemSize + 2]
        );
        normals.push(
          normalBuffer.array[i * normalBuffer.itemSize + 0],
          normalBuffer.array[i * normalBuffer.itemSize + 1],
          normalBuffer.array[i * normalBuffer.itemSize + 2]
        );
        colors.push(0.7, 0.6, 0.8);
      }
      indices.push(vertexMap.get(hash)!);
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setIndex(indices);

    const positionAttribute = new THREE.Float32BufferAttribute(vertices, 3);

    positionAttribute.setUsage(THREE.DynamicDrawUsage);

    geometry.setAttribute("position", positionAttribute);
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const edgeSet = new Set<string>();
    const edgeHash = (edge: [number, number]) => `${min(...edge)}${max(...edge)}`;
    const isUnique = addIfUnique(edgeSet);

    for (let i = 0; i < indices.length / 3; i++) {
      const a = indices[i * 3 + 0];
      const b = indices[i * 3 + 1];
      const c = indices[i * 3 + 2];

      const edges = [
        [a, b],
        [b, c],
        [c, a]
      ];

      edges.forEach((edge: [number, number]) => {
        const hash = edgeHash(edge);
        if (isUnique(hash)) {
          edgeindices.push(...edge);
        }
      });
    }

    const material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      vertexColors: THREE.VertexColors
    });

    geometry.addGroup(0, 72, 1);
    // geometry.addGroup(24, 72, 1);

    const material1 = new THREE.MeshPhongMaterial({
      fog: false,
      transparent: true,
      // opacity: 0.1,
      side: THREE.DoubleSide,
      // reflectivity: 0.15,
      vertexColors: THREE.VertexColors,
      // color: new THREE.Color(0xaaaaaa),
      depthWrite: true,
      depthTest: false
    });

    const material2 = new THREE.MeshPhongMaterial({
      color: 0xaaaaaa,
      specular: 0xffffff,
      shininess: 250,
      side: THREE.DoubleSide,
      vertexColors: THREE.VertexColors
    });

    const lineGeometry = new THREE.BufferGeometry();

    this.mesh = new THREE.Mesh(geometry, [material1, material2]);

    this.add(this.mesh);

    lineGeometry.setIndex(edgeindices);

    lineGeometry.setAttribute("position", positionAttribute);
    const linematerial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true });

    this.add(new THREE.LineSegments(lineGeometry, linematerial));

    // this.add(new THREE.Mesh(bufferGeometry, defaults.materials.mesh));

    // this.mesh = new THREE.Mesh(props.geometry, defaults.materials.mesh);
    // this.mesh.geometry.name = "surface-geometry";
    this.mesh.geometry.computeBoundingBox();
    this.mesh.geometry.computeBoundingSphere();
  }

  get vertexBuffer() {
    return (this.mesh.geometry as THREE.BufferGeometry).getAttribute("position")!;
  }

  setVertexPosition(index: number, x: number, y: number, z: number) {
    //@ts-ignore
    this.vertexBuffer.setXYZ(index, x, y, z).needsUpdate = true;
  }

  save() {
    return {
      kind: this.kind,
      name: this.name,
      uuid: this.uuid,
      visible: this.visible,
      position: this.position.toArray(),
      rotation: this.rotation.toArray().slice(0, 3),
      scale: this.scale.toArray()
    } as ModelSaveObject;
  }
  restore(state: ModelSaveObject) {
    // this.init({} as any);
    this.visible = state.visible;
    this.position.set(state.position[0], state.position[1], state.position[2]);
    this.rotation.set(state.rotation[0], state.rotation[1], state.rotation[2], "XYZ");
    this.scale.set(state.scale[0], state.scale[1], state.scale[2]);
    this.uuid = state.uuid;
    return this;
  }

  select() {
    // this.surfaces.select();
  }
  deselect() {
    // this.surfaces.deselect();
  }

  calculateBoundingBox() {
    // this.boundingBox = this.surfaces.children.reduce((a: THREE.Box3, b: Container) => {
    //   (b as Surface).geometry.computeBoundingBox();
    //   return (a as THREE.Box3).union((b as Surface).geometry.boundingBox);
    // }, new THREE.Box3());
    // return this.boundingBox;
  }
  signedVolumeOfTriangle(p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3) {
    return p1.dot(p2.clone().cross(p3)) / 6.0;
  }
  volumeOfMesh() {
    // let sum = 0;
    // this.surfaces.children.forEach((surface: Surface) => {
    //   surface._triangles.forEach((triangle: THREE.Triangle) => {
    //     sum += this.signedVolumeOfTriangle(triangle.a, triangle.b, triangle.c);
    //   });
    // });
    // return Math.abs(sum);
  }

  get brief() {
    return {
      uuid: this.uuid,
      name: this.name,
      selected: this.selected,
      //@ts-ignore
      children: [],
      kind: this.kind
    };
  }
}
