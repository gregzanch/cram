import * as THREE from "three";
import { STLLoader as THREESTLLoader } from "three/examples/jsm/loaders/STLLoader";
import { TDSLoader } from "three/examples/jsm/loaders/TDSLoader"; 
import { STLLoader } from "./stl";
import { OBJLoader } from "./obj";
import { TGALoader } from "./tga";
import { DAELoader } from "./dae";
import { chunk } from "../common/chunk";
import roundTo from "../common/round-to";



export interface Model {
  name: string;
  geometry: THREE.BufferGeometry;
}

export function tds(data) { 
  const loader = new TDSLoader();
  const res = loader.parse(data,"/");
  return res;
}

export function stl2(data) {
  const loader = new THREESTLLoader();
  const res = loader.parse(data) as THREE.BufferGeometry;
  return res;
}

export function stl(data) {
  const loader = new STLLoader();
  const res = loader.parse(data) as THREE.BufferGeometry;
  const positionsAttribute = res.attributes["position"] as THREE.BufferAttribute;
  const normalsAttribute = res.attributes["normal"] as THREE.BufferAttribute;

  const positionsVertices = chunk(Array.from(positionsAttribute.array), 9);
  const normalsVertices = chunk(Array.from(normalsAttribute.array), 9);

  const models = [] as Model[];

  for (let i = 0; i < positionsVertices.length; i++) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(positionsVertices[i].map((x) => roundTo(x, 6))), 3, false)
    );
    geometry.setAttribute(
      "normals",
      new THREE.BufferAttribute(new Float32Array(normalsVertices[i].map((x) => roundTo(x, 6))), 3, false)
    );
    const name = "triangle-" + String(i);
    models.push({
      name,
      geometry
    });
  }

  return models;
}

export function obj(data) {
  const loader = new OBJLoader(data);
  const res = loader.parse();

  console.log(res);

  const [vertices, vertexNormals, textureCoords] = res.models.reduce(
    (a, b) => [
      a[0].concat(b.vertices), 
      a[1].concat(b.vertexNormals), 
      a[2].concat(b.textureCoords)
    ],
    [[] as any[], [] as any[], [] as any[]]
  );
  const models = [] as Model[];
  res.models.forEach((model) => {
    const buffer = new THREE.BufferGeometry();
    const verts = [] as number[];
    const vertNormals = [] as number[];
    const texCoords = [] as number[];
    model.faces.forEach((face) => {
      face.vertices.forEach((vertex) => {
        const v = vertices[vertex.vertexIndex - 1];
        v && verts.push(v.x, v.y, v.z);
        const vn = vertexNormals[vertex.vertexNormalIndex - 1];
        vn && vertNormals.push(vn.x, vn.y, vn.z);
        const tc = textureCoords[vertex.textureCoordsIndex - 1];
        tc && texCoords.push(tc.u, tc.v, tc.w);
      });
    });
    buffer.setAttribute("position", new THREE.BufferAttribute(new Float32Array(verts), 3, false));
    buffer.setAttribute("normals", new THREE.BufferAttribute(new Float32Array(vertNormals), 3, false));
    buffer.setAttribute("texCoords", new THREE.BufferAttribute(new Float32Array(texCoords), 3, false));
    const newModel = {
      name: model.name,
      geometry: buffer
    } as Model;
    models.push(newModel);
  });

  return models;
}

export function tga(data) {
  const loader = new TGALoader();
  const res = loader.parse(data);
  return res;
}

export function dae(data) {
  const loader = new DAELoader();
  var xml = new DOMParser().parseFromString(data, "application/xml");
  // console.log(xml);
  Object.assign(window, { xml });
  const res = loader.parse(data, undefined);
  return res;
}

export {dxf} from './dxf';