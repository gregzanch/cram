import * as THREE from "three";
import Container, { ContainerProps } from "./container";
import { chunk } from "../common/chunk";
import roundTo from "../common/round-to";
import { KeyValuePair } from "../common/key-value-pair";
import interpolateAlpha from "../compute/acoustics/interpolate-alpha";
import reflectionCoefficient from "../compute/acoustics/reflection-coefficient";
import { AcousticMaterial } from "../db/acoustic-material";
import { BRDF } from "../compute/raytracer/brdf";
import Room from "./room";
import { CSG } from '@jscad/csg';
import { numbersEqualWithinTolerence, equalWithinTolerenceFactory } from "../common/equal-within-range";

const v3eq = equalWithinTolerenceFactory<THREE.Vector3 | CSG.Vector3D>(["x", "y", "z"]);

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
  displayVertexNormals: false
};

export interface SurfaceProps extends ContainerProps {
  acousticMaterial: AcousticMaterial;
  geometry: THREE.BufferGeometry;
  wireframeVisible?: boolean;
  edgesVisible?: boolean;
  fillSurface?: boolean;
  displayVertexNormals?: boolean;
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

export interface SurfaceSaveObject {
  kind: string;
  name: string;
  uuid: string;
  position: number[];
  rotation: number[];
  scale: number[];
  acousticMaterial: AcousticMaterial;
  geometry: THREE.BufferGeometry;
  visible: boolean;
  wireframeVisible: boolean;
  edgesVisible: boolean;
  fillSurface: boolean;
  displayVertexNormals: boolean;
}

interface KeepLine {
  keep: boolean;
  line: number[][];
  triangle_normal: number[];
  triangle_index: number;
}

class Surface extends Container {
  // for render
  mesh!: THREE.Mesh;
  wire!: THREE.Mesh;
  edges!: THREE.LineSegments;

  center!: THREE.Vector3;

  triangles!: number[][][];
  fillSurface!: boolean;
  vertexNormals!: THREE.VertexNormalsHelper;
  _triangles!: THREE.Triangle[];
  selectedMaterial!: THREE.MeshLambertMaterial;
  normalMaterial!: THREE.MeshLambertMaterial;
  normalColor!: THREE.Color;

  // for acoustics
  numHits!: number;
  absorption!: number[];
  absorptionFunction!: (freq: number) => number;
  reflection!: number[];
  reflectionFunction!: (freq: number, theta: number) => number;
  _acousticMaterial!: AcousticMaterial;
  brdf!: BRDF[];
  area!: number;
  isPlanar!: boolean;
  edgeLoop!: THREE.Vector3[];
  polygon!: CSG.Polygon;
  normal!: THREE.Vector3;
  // renderer: Renderer;
  constructor(name: string, props?: SurfaceProps) {
    super(name);
    this.kind = "surface";
    props && this.init(props, true);
  }
  init(props: SurfaceProps, fromConstructor: boolean = false) {
    if (!fromConstructor) {
      this.remove(this.mesh);
      this.remove(this.wire);
      this.remove(this.edges);
      this.remove(this.vertexNormals);
    }

    this.fillSurface = props.fillSurface || defaults.fillSurface;
    this.wire = new THREE.Mesh(props.geometry, defaults.materials.wire);
    this.wire.geometry.name = "surface-wire-geometry";
    this.numHits = 0;
    this.mesh = new THREE.Mesh(props.geometry, defaults.materials.mesh);
    this.mesh.geometry.name = "surface-geometry";
    this.mesh.geometry.computeBoundingBox();
    this.mesh.geometry.computeBoundingSphere();

    // this.mesh.geometry.computeVertexNormals();
    const tempmesh = new THREE.Mesh(props.geometry.clone(), undefined);
    tempmesh.geometry.computeVertexNormals();
    this.vertexNormals = new THREE.VertexNormalsHelper(tempmesh, 0.25, 0xff0000, 1);
    this.vertexNormals.geometry.name = "surface-vertex-normals-geometry";
    this.triangles = chunk(
      chunk(Array.from((props.geometry.getAttribute("position") as THREE.BufferAttribute).array), 3),
      3
    );
    this._triangles = this.triangles.map(
      (x) => new THREE.Triangle(new THREE.Vector3(...x[0]), new THREE.Vector3(...x[1]), new THREE.Vector3(...x[2]))
    );
    
    const eq = v3eq(CSG.EPS);

    this.isPlanar = this._triangles
      .map((x) => x.getNormal(new THREE.Vector3()))
      .reduce((a, b, i, arr) => a && eq(b, arr[0]), true);
    
    if (!this.isPlanar) {
      console.error(new Error(`Surface '${this.name}' is not planar`));
      debugger;
    }
    
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
    
    this.polygon = new CSG.Polygon(
      this.edgeLoop.map(x => {
        return new CSG.Vertex(new CSG.Vector3D([x.x, x.y, x.z]));
      })
    );
    
    
    
    const eqeps = numbersEqualWithinTolerence(CSG.EPS);
    
    const n0 = this.normal;
    const n1 = () => this.polygon.plane.normal;
    if (!eqeps(n0.x, n1().x) || !eqeps(n0.y, n1().y) || !eqeps(n0.z, n1().z)) {
      this.polygon.plane = this.polygon.plane.flipped();
      if (!eqeps(n0.x, n1().x) || !eqeps(n0.y, n1().y) || !eqeps(n0.z, n1().z)) {
        console.error(new Error(`Surface '${this.name}' has a normal vector issue`));
      }
    }
   
    
    this.polygon.parentSurface = this;
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
  restore(state: SurfaceSaveObject) {
    this.init({ ...state });
    this.visible = state.visible;
    this.position.set(state.position[0], state.position[1], state.position[2]);
    this.rotation.set(state.rotation[0], state.rotation[1], state.rotation[2], "XYZ");
    this.scale.set(state.scale[0], state.scale[1], state.scale[2]);
    this.uuid = state.uuid;
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
  flipNormals() {}

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
          }
          else if (edgeLoop[edgeLoop.length - 1].equals(edgePairs[i][1])) {
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
  get room() {
    return this.parent!.parent! as Room;
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

export default Surface;
