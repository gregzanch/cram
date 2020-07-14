import { CSG } from '@jscad/csg';
import { Surface } from '../../objects/surface';
import { expose } from '../../common/expose';
// import { splitPolygonByPlane } from './split-polygon';

import csg from '../csg';
expose({ csg });

// class Node {
//   front: Node[];
//   back: Node[];
//   polygon: CSG.Polygon
//   constructor(polygon: CSG.Polygon, front?: Node[], back?: Node[]) {
//     this.polygon = polygon;
//     this.front = front || [] as Node[];
//     this.back = back || [] as Node[];
//   }
// }

export class BSP {
  constructor() {
    console.log(csg);
  }
  construct(surfaces: Surface[]) {
    // const tree = new Node()
    // debugger;
    // const polygonNodes = surfaces.map(x => new Node(x.polygon));
    // let bestIndex = 0;
    // let best = 0;
    // polygonNodes.forEach((node, index) => {
    //   const distanceArray = [] as number[];
    //   for (let i = 0; i < polygonNodes.length; i++) {
    //     if (i != index) {
    //       const { distances, willIntersect } = this.getPointDistances(node.polygon, polygonNodes[i].polygon);
    //       distanceArray.push(...distances);
    //     }
    //   }
    //   let magnitudeSum = 0;
    //   let balanceSum = 0;
    //   distanceArray.forEach((distance) => {
    //     magnitudeSum += Math.abs(distance);
    //     balanceSum += distance;
    //   });
    //   if (magnitudeSum + balanceSum > best) {
    //     best = magnitudeSum + balanceSum;
    //     bestIndex = index;
    //   }
    // });
    // const tree = polygonNodes[bestIndex];
    // for (let i = 0; i < polygonNodes.length; i++) {
    //   if (i != bestIndex) {
    //     // const { distances, willIntersect } = this.getPointDistances(tree.polygon, polygonNodes[i].polygon);
    //     // if (willIntersect) {
          
          
    //     // } else {
    //     //   if (distances.reduce((a,b)=>a&&b<0, true)) {
    //     //     tree.back.push(polygonNodes[i]);
    //     //   } else {
    //     //     tree.front.push(polygonNodes[i]);
    //     //   }
    //     // }
    //     const res = splitPolygonByPlane(tree.polygon.plane, polygonNodes[i].polygon);
    //     console.log(res);
    //   }
    // }
  }
  getPointDistances(p1, p2) {
    // const distances = p2.vertices
    //   .map((v) => {
    //     return p1.plane.signedDistanceToPoint(v.pos);
    //   })
    //   .filter((x) => x);
    // return {
    //   distances,
    //   willIntersect: !distances.reduce((a, b, i, arr) => a && Math.sign(b) == Math.sign(arr[0]), true)
    // }
  }
}

