import * as THREE from 'three';
import { STLLoader, OBJLoader } from "../render/loaders";
const STL = new STLLoader();


export function stl(data) {
  return STL.parseASCII(data)
};
export function obj(data) {
    const loader = new OBJLoader(data);
    const res = loader.parse();

    const [vertices, vertexNormals, textureCoords] = res.models.reduce(
      (a, b) => [a[0].concat(b.vertices), a[1].concat(b.vertexNormals), a[2].concat(b.textureCoords)],
      [[] as any[], [] as any[], [] as any[]]
    );
    const models = res.models.map(model => {
      const buffer = new THREE.BufferGeometry();
      const verts = [] as number[];
      const vertNormals = [] as number[];
      const texCoords = [] as number[];
      model.faces.forEach(face => {
        face.vertices.forEach(vertex => {
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
      return {
        name: model.name,
        geometry: buffer
      };
    });

    return models;
}
