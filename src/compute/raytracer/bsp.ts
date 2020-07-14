import { CSG } from '@jscad/csg';
import { Surface } from '../../objects/surface';
import { expose } from '../../common/expose';
// import { splitPolygonByPlane } from './split-polygon';

import { math, geometry, splitPolygonByPlane, } from '../csg';

// import {PolygonTreeNode} from './trees/polygon-tree-node';
// import {PolygonTreeNode} from './trees/polygon-tree-node';
import {Tree} from './trees/tree';




const plane = math.plane;
const poly3 = geometry.poly3;


export class BSP {
  tree!: Tree;
  constructor() {
    
  }
  construct(surfaces: Surface[]) {
    // const tree = new Node()
    debugger;
    this.tree = new Tree(surfaces.map((x) => x.polygon));
  }
  getPointDistances(p1, p2) {
    const distances = p2.vertices
      .map((v) => {
        return p1.plane.signedDistanceToPoint(v.pos);
      })
      .filter((x) => x);
    return {
      distances,
      willIntersect: !distances.reduce((a, b, i, arr) => a && Math.sign(b) == Math.sign(arr[0]), true)
    }
  }
}

