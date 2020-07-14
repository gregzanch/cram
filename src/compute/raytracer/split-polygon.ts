import { CSG } from '@jscad/csg';
import { equalWithinTolerenceFactory } from '../../common/equal-within-range';

const vector3sAreEqual = equalWithinTolerenceFactory(["x", "y", "z"])(CSG.EPS);
const planeWsAreEqual = equalWithinTolerenceFactory(["w"])(CSG.EPS);
const planesAreEqual = (plane1, plane2) => {
  return vector3sAreEqual(plane1.normal, plane2.normal) && planeWsAreEqual(plane1, plane2);
}

export const splitLineSegmentByPlane = (plane: CSG.Plane, p1: CSG.Vector3D, p2: CSG.Vector3D) => {
  const direction = CSG.Vector3D.subtract(p2, p1);
  let lambda = (plane[3] - CSG.Vector3D.dot(plane, p1)) / CSG.Vector3D.dot(plane, direction);
  if (Number.isNaN(lambda)) lambda = 0;
  if (lambda > 1) lambda = 1;
  if (lambda < 0) lambda = 0;

  CSG.Vector3D.scale(direction, lambda, direction);
  CSG.Vector3D.add(direction, p1, direction);
  return direction;
}



export const SPLIT_POLYGON_RESULT_TYPE = {
  COPLANAR_FRONT: "COPLANAR_FRONT",
  COPLANAR_BACK: "COPLANAR_BACK",
  FRONT: "FRONT",
  BACK: "BACK",
  SPANNING: "SPANNING",
  NULL: "NULL"
}


// .type:
//   0: coplanar-front
//   1: coplanar-back
//   2: front
//   3: back
//   4: spanning
// In case the polygon is spanning, returns:
// .front: a Polygon3 of the front part
// .back: a Polygon3 of the back part


/**
 * @param splane split plane
 * @param polygon polygon to split
 */
export const splitPolygonByPlane = (splane: CSG.Plane, polygon: CSG.Polygon) => {
  let result = {
    type: "NULL" as keyof typeof SPLIT_POLYGON_RESULT_TYPE,
    front: {} as typeof CSG.Polygon,
    back: {} as typeof CSG.Polygon,
  };
  // cache in local lets (speedup):
  let vertices = polygon.vertices;
  let numvertices = vertices.length;
  if (planesAreEqual(polygon.plane, splane)) {
    result.type = "COPLANAR_FRONT";
  } else {
    let hasfront = false;
    let hasback = false;
    let vertexIsBack = [] as Boolean[];
    let MINEPS = -CSG.EPS;
    for (let i = 0; i < numvertices; i++) {
      let t = CSG.Vector3D.dot(splane, vertices[i]) - splane[3];
      let isback = (t < 0);
      vertexIsBack.push(isback);
      if (t > CSG.EPS) hasfront = true;
      if (t < MINEPS) hasback = true;
    }
    if ((!hasfront) && (!hasback)) {
      // all points coplanar
      let t = CSG.Vector3D.dot(splane, polygon.plane);
      result.type = (t >= 0) ? "COPLANAR_FRONT" : "COPLANAR_BACK";
    } else if (!hasback) {
      result.type = "FRONT";
    } else if (!hasfront) {
      result.type = "BACK";
    } else {
      // spanning
      result.type = "SPANNING";
      let frontvertices = [] as Array<typeof CSG.Vector3D>;
      let backvertices = [] as Array<typeof CSG.Vector3D>;
      let isback = vertexIsBack[0];
      for (let vertexindex = 0; vertexindex < numvertices; vertexindex++) {
        let vertex = vertices[vertexindex];
        let nextvertexindex = vertexindex + 1;
        if (nextvertexindex >= numvertices) nextvertexindex = 0;
        let nextisback = vertexIsBack[nextvertexindex];
        if (isback === nextisback) {
          // line segment is on one side of the plane:
          if (isback) {
            backvertices.push(vertex);
          } else {
            frontvertices.push(vertex);
          }
        } else {
          // line segment intersects plane:
          let point = vertex;
          let nextpoint = vertices[nextvertexindex];
          let intersectionpoint = splitLineSegmentByPlane(splane, point, nextpoint);
          if (isback) {
            backvertices.push(vertex);
            backvertices.push(intersectionpoint);
            frontvertices.push(intersectionpoint);
          } else {
            frontvertices.push(vertex);
            frontvertices.push(intersectionpoint);
            backvertices.push(intersectionpoint);
          }
        }
        isback = nextisback;
      } // for vertexindex
      // remove duplicate vertices:
      let EPS_SQUARED = CSG.EPS * CSG.EPS;
      if (backvertices.length >= 3) {
        let prevvertex = backvertices[backvertices.length - 1];
        for (let vertexindex = 0; vertexindex < backvertices.length; vertexindex++) {
          let vertex = backvertices[vertexindex];
          if (CSG.Vector3D.squaredDistance(vertex, prevvertex) < EPS_SQUARED) {
            backvertices.splice(vertexindex, 1);
            vertexindex--;
          }
          prevvertex = vertex;
        }
      }
      if (frontvertices.length >= 3) {
        let prevvertex = frontvertices[frontvertices.length - 1];
        for (let vertexindex = 0; vertexindex < frontvertices.length; vertexindex++) {
          let vertex = frontvertices[vertexindex];
          if (CSG.Vector3D.squaredDistance(vertex, prevvertex) < EPS_SQUARED) {
            frontvertices.splice(vertexindex, 1);
            vertexindex--;
          }
          prevvertex = vertex;
        }
      }
      if (frontvertices.length >= 3) {
        result.front = CSG.Polygon.fromPointsAndPlane(frontvertices, polygon.plane);
      }
      if (backvertices.length >= 3) {
        result.back = CSG.Polygon.fromPointsAndPlane(backvertices, polygon.plane);
      }
    }
  }
  return result;
};
