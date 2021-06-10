import * as THREE from "three";
import Container, { ContainerProps } from "./container";
import { chunk, chunkf32 } from "../common/chunk";
import roundTo from "../common/round-to";
import { KeyValuePair } from "../common/key-value-pair";
import interpolateAlpha from "../compute/acoustics/interpolate-alpha";
import reflectionCoefficient from "../compute/acoustics/reflection-coefficient";
import { AcousticMaterial } from "../db/acoustic-material";
import { BRDF } from "../compute/raytracer/brdf";
import Room from "./room";
import csg from "../compute/csg";
import { numbersEqualWithinTolerence, equalWithinTolerenceFactory } from "../common/equal-within-range";
import { addContainer, removeContainer, setContainerProperty, setNestedContainerProperty } from "../store";
import { on } from "../messenger";
import {scatteringFunction} from '../compute/acoustics/scattering-function';
import { TessellateModifier } from "../compute/radiance/TessellateModifier";
import { Float32BufferAttribute } from "three";
import SurfaceElement from "./surface-element";

const v3eq = equalWithinTolerenceFactory(["x", "y", "z"])(csg.math.constants.EPS as number);

/** Vector3 as an array (i.e. [x,y,z]) */
export type Vector3A = [number, number, number];

/** Triangle as an array (i.e. [p1,p2,p3]) */
export type TriangleA= [Vector3A, Vector3A, Vector3A];

/** Triangle Array */
export type Triangles = number[][][];


const defaults = {
  materials: {
    selected: new THREE.MeshLambertMaterial({
      fog: false,
      color: new THREE.Color(0xb3d7ff),
      // emissiveIntensity: 2,
      // emissive: new THREE.Color(1, 1, 0),
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      reflectivity: 0.15,
      depthWrite: true,
      depthTest: false,
      name: "surface-selected-material"
    }),

    mesh: new THREE.MeshLambertMaterial({
      fog: false,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      // emissive: new THREE.Color(0xffffff),
      // emissiveIntensity: 0,
      reflectivity: 0.15,
      color: new THREE.Color(0xaaaaaa),
      depthWrite: true,
      depthTest: false,
      name: "surface-material"
    }),

    wire: new THREE.MeshBasicMaterial({
      fog: false,
      side: THREE.FrontSide,
      wireframe: true,
      color: 0x2c2d2d,
      name: "surface-wireframe-material"
    }),
    line: new THREE.LineBasicMaterial({
      fog: false,
      color: 0x999999,
      name: "surface-edges-material"
    })
  },
  wireframeVisible: false,
  edgesVisible: true,
  fillSurface: true,
  displayVertexNormals: false,
  scatteringCoefficient: 0.1,
};

export interface SurfaceProps extends ContainerProps {
  acousticMaterial: AcousticMaterial;
  geometry: THREE.BufferGeometry;
  wireframeVisible?: boolean;
  edgesVisible?: boolean;
  fillSurface?: boolean;
  displayVertexNormals?: boolean;
  scatteringCoefficient?: number;
}

export interface BufferGeometrySaveObject {
  metadata: {
    version: number;
    type: string;
    generator: string;
  };
  uuid: string;
  type: string;
  name: string;
  data: {
    attributes: {
      position: {
        itemSize: number;
        type: string;
        array: number[];
        normalized: boolean;
      };
      normals: {
        itemSize: number;
        type: string;
        array: number[];
        normalized: boolean;
      };
      texCoords: {
        itemSize: number;
        type: string;
        array: number[];
        normalized: boolean;
      };
    };
    boundingSphere: {
      center: number[];
      radius: number;
    };
  };
}

function restoreBufferGeometry(geom: BufferGeometrySaveObject){

  const geometry = new THREE.BufferGeometry();
  
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      new Float32Array(geom.data.attributes.position.array),
      geom.data.attributes.position.itemSize,
      geom.data.attributes.position.normalized
    )
  );
  if(geom.data.attributes['normals']){
    geometry.setAttribute(
      "normals",
      new THREE.BufferAttribute(
        new Float32Array(geom.data.attributes.normals.array),
        geom.data.attributes.normals.itemSize,
        geom.data.attributes.normals.normalized
      )
    );
  }
  else{
    geometry.computeVertexNormals();
    geometry.setAttribute("normals", geometry.getAttribute("normal"));
  }
  if(geom.data.attributes['texCoords']){
    geometry.setAttribute(
      "texCoords",
      new THREE.BufferAttribute(
        new Float32Array(geom.data.attributes.texCoords.array),
        geom.data.attributes.texCoords.itemSize,
        geom.data.attributes.texCoords.normalized
      )
    );
  }
  geometry.name = geom.name;
  geometry.uuid = geom.uuid;

  return geometry;

}

export interface SurfaceSaveObject {
  kind: string;
  name: string;
  uuid: string;
  position: number[];
  rotation: number[];
  scale: number[];
  acousticMaterial: AcousticMaterial;
  geometry: BufferGeometrySaveObject;
  visible: boolean;
  wireframeVisible: boolean;
  edgesVisible: boolean;
  fillSurface: boolean;
  displayVertexNormals: boolean;
  scatteringCoefficient: number;
}

interface KeepLine {
  keep: boolean;
  line: number[][];
  triangle_normal: number[];
  triangle_index: number;
}

type poly3type = {
  vertices: any;
  plane: any;
};

class Surface extends Container {
  // for render
  mesh!: THREE.Mesh;
  wire!: THREE.Mesh;
  edges!: THREE.LineSegments;
  center!: THREE.Vector3;
  triangles!: Triangles;
  fillSurface!: boolean;
  vertexNormals!: THREE.VertexNormalsHelper;
  _triangles!: THREE.Triangle[];
  selectedMaterial!: THREE.MeshLambertMaterial;
  normalMaterial!: THREE.MeshLambertMaterial;
  normalColor!: THREE.Color;

  /** tessellation of this surface (used for ART) */
  tessellatedMesh = null as THREE.Mesh|null;

  // for acoustics
  numHits!: number;
  absorption!: number[];
  absorptionFunction!: (freq: number) => number;
  reflection!: number[];
  reflectionFunction!: (freq: number, theta: number) => number;
  _scatteringCoefficient!: number;
  scatteringFunction!: (f: number) => number;
  _acousticMaterial!: AcousticMaterial;
  brdf!: BRDF[];
  area!: number;
  isPlanar!: boolean;
  edgeLoop!: THREE.Vector3[];
  polygon!: poly3type;
  normal!: THREE.Vector3;
  eventDestructors!: Array<() => void>;

  constructor(name: string, props?: SurfaceProps) {
    super(name);
    this.kind = "surface";
    this.eventDestructors = [];
    props && this.init(props, true);
  }
  destroyEvents() {
    while(this.eventDestructors.length > 0) {
      this.eventDestructors[this.eventDestructors.length-1]();
      this.eventDestructors.pop();
    }
  }
  init(props: SurfaceProps, fromConstructor: boolean = false) {

    // if the call isn't coming from the constructor it's probably being restored
    if (!fromConstructor) { 
      this.remove(this.mesh);
      this.remove(this.wire);
      this.remove(this.edges);
      this.remove(this.vertexNormals);
      this.destroyEvents();
    }

    // merge the incoming props with the default props
    const mergedProps = {...defaults, ...props};
    

    this.numHits = 0;
    this.fillSurface = mergedProps.fillSurface;
    
    this.wire = new THREE.Mesh(mergedProps.geometry, mergedProps.materials.wire);
    this.wire.geometry.name = "surface-wire-geometry";

    this.mesh = new THREE.Mesh(mergedProps.geometry, mergedProps.materials.mesh);
    this.mesh.geometry.name = "surface-geometry";
    this.mesh.geometry.computeBoundingBox();
    this.mesh.geometry.computeBoundingSphere();
    this.mesh.geometry.computeVertexNormals();

    // this.mesh.geometry.computeVertexNormals();
    // const tempmesh = new THREE.Mesh(mergedProps.geometry.clone(), undefined);
    // tempmesh.geometry.computeVertexNormals();
    this.vertexNormals = new THREE.VertexNormalsHelper(this.mesh, 0.25, 0xff0000, 1);
    this.vertexNormals.geometry.name = "surface-vertex-normals-geometry";

    // console.log(mergedProps.geometry.getIndex());
    // console.log(mergedProps.geometry.getAttribute("position"));

    this.triangles = chunk(
      chunk(Array.from((mergedProps.geometry.getAttribute("position") as THREE.BufferAttribute).array), 3),
      3
    );

    this._triangles = this.triangles.map(
      (x) =>
        new THREE.Triangle(
          new THREE.Vector3(x[0][0], x[0][1], x[0][2]),
          new THREE.Vector3(x[1][0], x[1][1], x[1][2]),
          new THREE.Vector3(x[2][0], x[2][1], x[2][2])
        )
    );

    

    this.normal = new THREE.Vector3();
    this._triangles[0].getNormal(this.normal);

    this.center = new THREE.Vector3();
    let area = 0;
    this._triangles.forEach((tri) => {
      const a = tri.getArea();
      area += a;
      this.center.add(tri.getMidpoint(new THREE.Vector3()).multiplyScalar(a));
    });
    this.center.divideScalar(area);

    this.selectedMaterial = defaults.materials.selected;
    this.normalMaterial = defaults.materials.mesh;
    this.normalColor = new THREE.Color(0xaaaaaa);

    const dict = {} as KeyValuePair<KeepLine>;

    // for each triangle
    this.triangles.forEach((tri, index) => {
      // get the triangles normal
      const normal = this._triangles[index]
        .getNormal(new THREE.Vector3())
        .toArray()
        .map((x) => roundTo(x, 5));

      // for each of the triangles vertices
      for (let i = 0; i < 3; i++) {
        // construct line from current vertex to the vertex
        const line = [tri[i], tri[(i + 1) % 3]];
        // the identifier of the line
        const linekey = JSON.stringify([line.sort(), normal]);
        // if the line hasnt been seen before
        if (!dict[linekey]) {
          // add it to the dictionary
          dict[linekey] = {
            keep: true,
            line: line,
            triangle_normal: normal,
            triangle_index: index
          };
        } else {
          // make sure we dont keep this edge
          dict[linekey].keep = false;
          const otherIndex = dict[linekey].triangle_index;
        }
      }
    });

    const segments = new THREE.Geometry();
    const edges = Object.keys(dict)
      .reduce((a, b: string) => {
        if (dict[b].keep) {
          a.push(dict[b].line);
        }
        return a;
      }, [] as number[][][])
      .forEach((edge) => {
        edge.forEach((vert) => {
          segments.vertices.push(new THREE.Vector3(vert[0], vert[1], vert[2]));
        });
      });
    this.edges = new THREE.LineSegments(segments, defaults.materials.line);
    this.edges.geometry.name = "surface-edges-geometry";

    this.add(this.mesh);
    this.mesh.visible = this.fillSurface;
    this.add(this.wire);
    this.wireframeVisible = props.wireframeVisible || defaults.wireframeVisible;
    this.add(this.edges);
    this.edgesVisible = props.edgesVisible || defaults.edgesVisible;
    this.add(this.vertexNormals);
    this.displayVertexNormals = props.displayVertexNormals || defaults.displayVertexNormals;

    this.absorption = [0.0, 0.04, 0.23, 0.52, 0.9, 0.94, 0.66, 0.66];
    const freq = [63, 125, 250, 500, 1000, 2000, 4000, 8000];
    this.absorptionFunction = interpolateAlpha(this.absorption, freq);
    this.reflectionFunction = (freq, theta) => reflectionCoefficient(this.absorptionFunction(freq), theta);
    this.scatteringCoefficient = props.scatteringCoefficient || defaults.scatteringCoefficient;
    this.acousticMaterial = props.acousticMaterial;
    this.brdf = [] as BRDF[];
    for (const key in this.acousticMaterial.absorption) {
      this.brdf.push(
        new BRDF({
          absorptionCoefficient: this.acousticMaterial.absorption[key],
          diffusionCoefficient: 0.1
        })
      );
    }
    this.getArea();

    this.edgeLoop = this.calculateEdgeLoop();

    const points = this.edgeLoop.map((x) => csg.math.vec3.fromArray([x.x, x.y, x.z]));
    const plane = csg.math.plane.fromPoints(points[0], points[1], points[2]);
    // console.log("points", points);
    // console.log("plane", plane);
    this.polygon = csg.geometry.poly3.fromPointsAndPlane(points, plane);

    const almostEquals = numbersEqualWithinTolerence(1e-6);

    const normalAlmostEqualsPlane = (n0, n1) => !almostEquals(n0.x, n1[0]) || !almostEquals(n0.y, n1[1]) || !almostEquals(n0.z, n1[2])

    if (normalAlmostEqualsPlane(this.normal, this.polygon.plane)) {
      // console.warn(new Error(`Surface '${this.name}' has a normal vector issue`));
      this.polygon = csg.geometry.poly3.fromPointsAndPlane(points, csg.math.plane.fromPoints(points[2], points[1], points[0]));
      // console.log("flipping", this.normal.toArray(), [...this.polygon.plane]);
        if (normalAlmostEqualsPlane(this.normal, this.polygon.plane)) {
          // console.log("still not equal", this.normal.toArray(), [...this.polygon.plane]);
          // console.log("points", points);
          // console.log("plane", plane);
          // console.log(this);
          // console.warn(new Error(`Surface '${this.name}' has a normal vector issue`));
    
          // this.polygon = csg.geometry.poly3.fromPointsAndPlane(points, csg.math.plane.fromPoints(points[2], points[1], points[0]));
    
        }
  
    }

    // this.polygon.parentSurface = this;
    // this.eventDestructors.push(
      // on("SURFACE_SET_PROPERTY", ({ uuid, property, value }) => {
      //   if(uuid === this.uuid){
          
      //   }
      // })
    // );
  }
  dispose(){
    this.parent && this.parent.remove(this);
  }
  save() {

    return {
      kind: this.kind,
      visible: this.visible,
      acousticMaterial: this.acousticMaterial,
      geometry: this.mesh.geometry.toJSON(),
      displayVertexNormals: this.displayVertexNormals,
      fillSurface: this.fillSurface,
      wireframeVisible: this.wireframeVisible,
      edgesVisible: this.edgesVisible,
      name: this.name,
      position: this.position.toArray(),
      rotation: this.rotation.toArray().slice(0, 3),
      scale: this.scale.toArray(),
      uuid: this.uuid
    } as SurfaceSaveObject;
  }

  restore(surfaceState: SurfaceSaveObject) {

    // console.log(surfaceState)

    this.init({
      acousticMaterial: surfaceState.acousticMaterial,
      geometry: restoreBufferGeometry(surfaceState.geometry),
      wireframeVisible: surfaceState.wireframeVisible,
      edgesVisible: surfaceState.edgesVisible,
      fillSurface: surfaceState.fillSurface,
      displayVertexNormals: surfaceState.displayVertexNormals,
      scatteringCoefficient: surfaceState.scatteringCoefficient
    });
    this.visible = surfaceState.visible;
    this.uuid = surfaceState.uuid;
    this.position.set(surfaceState.position[0], surfaceState.position[1], surfaceState.position[2]);
    this.rotation.set(surfaceState.rotation[0], surfaceState.rotation[1], surfaceState.rotation[2], "XYZ");
    this.scale.set(surfaceState.scale[0], surfaceState.scale[1], surfaceState.scale[2]);
    return this;
  }
  select() {
    this.selected = true;
    (this.mesh.material as THREE.MeshLambertMaterial | THREE.ShaderMaterial) = this.selectedMaterial;
    (this.mesh.material as THREE.MeshLambertMaterial).needsUpdate = true;
  }
  deselect() {
    this.selected = false;
    (this.mesh.material as THREE.MeshLambertMaterial) = this.normalMaterial;
    (this.mesh.material as THREE.MeshLambertMaterial).needsUpdate = true;
  }


  resetHits() {
    this.numHits = 0;
  }
  getArea() {
    this.area = 0;
    for (let i = 0; i < this._triangles.length; i++) {
      this.area += this._triangles[i].getArea();
    }
    return this.area;
  }
  getEdges() {
    return this.edges;
  }
  calculateEdgeLoop() {
    const verts = (this.edges.geometry as THREE.Geometry).vertices;
    // const uniqVerts = [...new Set(verts.map(x=>JSON.stringify(x.toArray())))].map(x=>new THREE.Vector3().fromArray(JSON.parse(x)))
    const edgePairs = chunk(verts, 2);
    const edgeLoop = [] as THREE.Vector3[];

    let j = 0;
    edgeLoop.push(edgePairs[j][0]);
    edgeLoop.push(edgePairs[j][1]);
    while (edgeLoop.length < edgePairs.length) {
      for (let i = 0; i < edgePairs.length; i++) {
        if (i != j) {
          if (edgeLoop[edgeLoop.length - 1].equals(edgePairs[i][0])) {
            edgeLoop.push(edgePairs[i][1]);
            j = i;
            break;
          } else if (edgeLoop[edgeLoop.length - 1].equals(edgePairs[i][1])) {
            edgeLoop.push(edgePairs[i][0]);
            j = i;
            break;
          }
        }
      }
    }

    return edgeLoop;
  }


  mergeSurfaces(surfaces: Surface[]) {
    const name = this.name + "-merged";
    const acousticMaterial = this.acousticMaterial;
    const geometry = new THREE.BufferGeometry();
    const geometryAttributes = {} as any;
    for (let i = 0; i < surfaces.length; i++) {
      const geom = surfaces[i].mesh.geometry as THREE.BufferGeometry;
      const attributeKeys = Object.keys(geom.attributes);
      attributeKeys.forEach((attr) => {
        if (attr.match(/position|normals?/gim)) {
          if (!geometryAttributes[attr]) {
            geometryAttributes[attr] = {
              arr: Array.from(geom.attributes[attr].array),
              itemSize: geom.attributes[attr].itemSize
            };
          } else {
            geometryAttributes[attr].arr = geometryAttributes[attr].arr.concat(Array.from(geom.attributes[attr].array));
          }
        }
      });
    }
    Object.keys(geometryAttributes).forEach((attr) => {
      geometry.setAttribute(
        attr,
        new THREE.BufferAttribute(new Float32Array(geometryAttributes[attr].arr), geometryAttributes[attr].itemSize)
      );
    });
    const surface = new Surface(name, {
      geometry,
      acousticMaterial
    });
    return surface;
  }


  tessellate(tessellateModifier: TessellateModifier){
    if(this.tessellatedMesh){
      this.remove(this.tessellatedMesh);
    }
    const geometry = tessellateModifier.modify( this.geometry );
    this.tessellatedMesh = new THREE.Mesh(geometry, this.wire.material);
    this.add(this.tessellatedMesh);

    const position = geometry.getAttribute('position') as Float32BufferAttribute;
    const array = position.array as Float32Array;
    const surfaceElements = [] as SurfaceElement[];
    for(let i = 0; i<position.count; i+=3){
      const element = new SurfaceElement(position, i+0, i+1, i+2);
      surfaceElements.push(element);
    }
    

    return this.tessellatedMesh;
  }

  get edgesVisible() {
    return this.edges.visible;
  }
  set edgesVisible(visible: boolean) {
    this.edges.visible = visible;
  }

  get acousticMaterial() {
    return this._acousticMaterial;
  }
  set acousticMaterial(material: AcousticMaterial) {
    this._acousticMaterial = material;
    const freq = Object.keys(this._acousticMaterial.absorption).map((x) => Number(x));
    this.absorption = freq.map((x) => this._acousticMaterial.absorption[String(x)]);
    this.absorptionFunction = interpolateAlpha(this.absorption, freq);
    this.reflectionFunction = (freq, theta) => reflectionCoefficient(this.absorptionFunction(freq), theta);
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
  get displayVertexNormals() {
    return this.vertexNormals.visible;
  }
  set displayVertexNormals(displayVertexNormals: boolean) {
    this.vertexNormals.visible = displayVertexNormals;
  }
  get geometry() {
    return this.mesh.geometry as THREE.BufferGeometry;
  }
  get faces() {
    return this._triangles;
  }
  get wireframeVisible() {
    return this.wire.visible;
  }
  set wireframeVisible(visible: boolean) {
    this.wire.visible = visible;
  }
  get tessellatedMeshVisible(){
    return this.tessellatedMesh ? this.tessellatedMesh.visible : false;
  }

  set tessellatedMeshVisible(visible: boolean) {
    if(this.tessellatedMesh){
      this.tessellatedMesh.visible = visible;
    }
  }

  get isTessellated(){
    return this.tessellatedMesh !== null;
  }

  get room() {
    return this.parent!.parent! as Room;
  }

  get brief() {
    return {
      uuid: this.uuid,
      name: this.name,
      selected: this.selected,
      kind: this.kind,
      children: []
    };
  }

  get scatteringCoefficient(){
    return this._scatteringCoefficient;
  }

  set scatteringCoefficient(coef: number){
    this._scatteringCoefficient = coef;
    this.scatteringFunction = scatteringFunction(coef);
  }
}

function mergeSurfaces(surfaces: Surface[]) {
  const name = surfaces[0].name + "-merged";
  const acousticMaterial = surfaces[0].acousticMaterial;
  const geometry = new THREE.BufferGeometry();
  const geometryAttributes = {} as any;
  for (let i = 0; i < surfaces.length; i++) {
    const geom = surfaces[i].mesh.geometry as THREE.BufferGeometry;
    const attributeKeys = Object.keys(geom.attributes);
    attributeKeys.forEach((attr) => {
      if (attr.match(/position|normals?/gim)) {
        if (!geometryAttributes[attr]) {
          geometryAttributes[attr] = {
            arr: Array.from(geom.attributes[attr].array),
            itemSize: geom.attributes[attr].itemSize
          };
        } else {
          geometryAttributes[attr].arr = geometryAttributes[attr].arr.concat(Array.from(geom.attributes[attr].array));
        }
      }
    });
  }
  Object.keys(geometryAttributes).forEach((attr) => {
    geometry.setAttribute(
      attr,
      new THREE.BufferAttribute(new Float32Array(geometryAttributes[attr].arr), geometryAttributes[attr].itemSize)
    );
  });
  const surface = new Surface(name, {
    geometry,
    acousticMaterial
  });
  return surface;
}

export { Surface, mergeSurfaces };



// this allows for nice type checking with 'on' and 'emit' from messenger
declare global {
  interface EventTypes {
    ADD_SURFACE: Surface | undefined;
    SURFACE_SET_PROPERTY: SetPropertyPayload<Surface>;
    REMOVE_SURFACE: string;
  }
}

on("ADD_SURFACE", addContainer(Surface))
on("REMOVE_SURFACE", removeContainer);
on("SURFACE_SET_PROPERTY", setContainerProperty)


export default Surface;
