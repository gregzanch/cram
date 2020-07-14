
// import { CSG } from '@jscad/csg';

// const splitPolygonByPlane = (poly: CSG.Polygon, plane: CSG.Plane) => {
//   // const dir = poly.plane.normal.cross(plane.normal);
//   const line = poly.plane.intersectWithPlane(plane);
//   const { point, direction } = line;
//   const point2 = point.plus(direction);
//   // const lines = [] as [CSG.Vector3d, CSG.Vector3d][];
//   const intersections = poly.vertices.map((x, i, a) => {
//     return LineLineIntersect(point, point2, a[i].pos, a[(i + 1) % a.length].pos);
//   });
// }



// function LineLineIntersect(
//   p1: CSG.Vector3D,
//   p2: CSG.Vector3D,
//   p3: CSG.Vector3D,
//   p4: CSG.Vector3D,
// ){

//   const EPS = 1e-13;
//   const p13 = p1.minus(p3);
//   const p43 = p4.minus(p3);
  
//   if (Math.abs(p43.x) < EPS && Math.abs(p43.y) < EPS && Math.abs(p43.z) < EPS) {
//     return;
//   }
//   const p21 = p2.minus(p1);

//   if (Math.abs(p21.x) < EPS && Math.abs(p21.y) < EPS && Math.abs(p21.z) < EPS) {
//     return;
//   }

//   const d1343 = p13.x * p43.x + p13.y * p43.y + p13.z * p43.z;
//   const d4321 = p43.x * p21.x + p43.y * p21.y + p43.z * p21.z;
//   const d1321 = p13.x * p21.x + p13.y * p21.y + p13.z * p21.z;
//   const d4343 = p43.x * p43.x + p43.y * p43.y + p43.z * p43.z;
//   const d2121 = p21.x * p21.x + p21.y * p21.y + p21.z * p21.z;

//   const denom = d2121 * d4343 - d4321 * d4321;
//   if (Math.abs(denom) < EPS) {
//     return;
//   }
  
//   const numer = d1343 * d4321 - d1321 * d4343;

//   const mua = numer / denom;
//   const mub = (d1343 + d4321 * (mua)) / d4343;

//   const pa = p1.plus(p21.times(mua));
//   const pb = p3.plus(p43.times(mub));
  

//   return [pa, pb];
// }


